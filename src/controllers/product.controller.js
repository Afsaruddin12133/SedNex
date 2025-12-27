const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");

const ALLOWED_BADGES = new Set(["new", "sale", "featured", "limited", "popular"]);

const trimToUndefined = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const ensureNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const collectUploadedImages = (files = []) => {
  if (!Array.isArray(files)) {
    return [];
  }
  return files
    .map((file) => trimToUndefined(file?.path || file?.secure_url))
    .filter(Boolean);
};

const convertToArray = (input) => {
  if (input === undefined || input === null) {
    return [];
  }
  if (Array.isArray(input)) {
    return input;
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      return [];
    }
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        if (parsed && typeof parsed === "object") {
          return [parsed];
        }
      } catch (error) {
        // ignore parse errors and fallback to comma separation
      }
    }
    return trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  if (typeof input === "object") {
    return [input];
  }
  return [];
};

const collectIndexedObjects = (body, fieldName) => {
  const pattern = new RegExp(`^${fieldName}\\[(\\d+)\\]\\[(\\w+)\\]$`);
  const bucket = {};
  Object.entries(body || {}).forEach(([key, value]) => {
    const match = key.match(pattern);
    if (!match) {
      return;
    }
    const index = parseInt(match[1], 10);
    if (!Number.isInteger(index)) {
      return;
    }
    const property = match[2];
    if (!bucket[index]) {
      bucket[index] = {};
    }
    bucket[index][property] = value;
  });

  return Object.keys(bucket)
    .sort((a, b) => Number(a) - Number(b))
    .map((idx) => bucket[idx]);
};

const fieldWasProvided = (body, fieldName) => {
  if (!body) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(body, fieldName)) {
    return true;
  }
  const prefix = `${fieldName}[`;
  return Object.keys(body).some((key) => key.startsWith(prefix));
};

const normalizeSpecifications = (rawValue, body) => {
  const records = [];
  const upsertRecord = (entry) => {
    const key = trimToUndefined(entry?.key ?? entry?.name);
    const value = trimToUndefined(entry?.value ?? entry?.desc ?? entry?.description);
    if (!key || !value) {
      return;
    }
    const lower = key.toLowerCase();
    const spec = { key, value };
    const existingIndex = records.findIndex((item) => item.key.toLowerCase() === lower);
    if (existingIndex >= 0) {
      records[existingIndex] = spec;
    } else {
      records.push(spec);
    }
  };

  collectIndexedObjects(body, "specifications").forEach((entry) => upsertRecord(entry));

  convertToArray(rawValue).forEach((entry) => {
    if (!entry) {
      return;
    }
    if (typeof entry === "string") {
      const [rawKey, ...rest] = entry.split(":");
      if (!rest.length) {
        return;
      }
      upsertRecord({ key: rawKey, value: rest.join(":") });
      return;
    }
    upsertRecord(entry);
  });

  return records;
};

const normalizeColorVariants = (rawValue, body) => {
  const variants = [];
  const upsertVariant = (candidate) => {
    if (!candidate) {
      return;
    }
    if (typeof candidate === "string") {
      const label = trimToUndefined(candidate);
      if (!label) {
        return;
      }
      if (!variants.some((variant) => variant.name.toLowerCase() === label.toLowerCase())) {
        variants.push({ name: label });
      }
      return;
    }
    const name = trimToUndefined(candidate.name ?? candidate.label ?? candidate.title);
    if (!name) {
      return;
    }
    const variant = { name };
    const code = trimToUndefined(
      candidate.code ?? candidate.hex ?? candidate.colorCode ?? candidate.color
    );
    if (code) {
      variant.code = code;
    }
    const stockNumber = ensureNumber(candidate.stock);
    if (stockNumber !== undefined && stockNumber >= 0) {
      variant.stock = stockNumber;
    }
    const lower = name.toLowerCase();
    const existingIndex = variants.findIndex((item) => item.name.toLowerCase() === lower);
    if (existingIndex >= 0) {
      variants[existingIndex] = variant;
    } else {
      variants.push(variant);
    }
  };

  collectIndexedObjects(body, "colorVariants").forEach((entry) => upsertVariant(entry));
  convertToArray(rawValue).forEach((entry) => upsertVariant(entry));

  return variants;
};

const normalizeBadges = (rawValue, body) => {
  const badges = [];
  const seen = new Set();
  const registerBadge = (value) => {
    const normalized = trimToUndefined(value);
    if (!normalized) {
      return;
    }
    const lower = normalized.toLowerCase();
    if (!ALLOWED_BADGES.has(lower) || seen.has(lower)) {
      return;
    }
    seen.add(lower);
    badges.push(lower);
  };

  convertToArray(rawValue).forEach((entry) => registerBadge(entry));
  Object.entries(body || {}).forEach(([key, value]) => {
    if (key.startsWith("badges[")) {
      registerBadge(value);
    }
  });

  return badges;
};

const collectBodyImages = (body) => {
  const images = [];
  const register = (input) => {
    const normalized = trimToUndefined(input);
    if (normalized) {
      images.push(normalized);
    }
  };

  ["images", "existingImages", "keepImages"].forEach((field) => {
    const value = body ? body[field] : undefined;
    if (Array.isArray(value)) {
      value.forEach((item) => register(item));
      return;
    }
    if (value !== undefined) {
      convertToArray(value).forEach((item) => register(item));
    }
  });

  Object.entries(body || {}).forEach(([key, value]) => {
    if (key.startsWith("images[")) {
      register(value);
    }
  });

  return Array.from(new Set(images));
};

const resolveCategory = async (categoryInput) => {
  const trimmed = trimToUndefined(categoryInput);
  if (!trimmed) {
    return undefined;
  }

  const baseQuery = { isActive: true };
  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    return Category.findOne({ ...baseQuery, _id: trimmed });
  }

  const normalized = trimmed.toLowerCase();

  const categoryBySlug = await Category.findOne({ ...baseQuery, slug: normalized });
  if (categoryBySlug) {
    return categoryBySlug;
  }

  return Category.findOne({
    ...baseQuery,
    name: { $regex: `^${normalized}$`, $options: "i" },
  });
};

const recalculateRatings = (product) => {
  const totalReviews = product.reviews.length;
  const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
  product.ratings.totalReviews = totalReviews;
  product.ratings.average = totalReviews ? Number((totalRating / totalReviews).toFixed(2)) : 0;
};

const createProduct = async (req, res) => {
  try {
    const name = trimToUndefined(req.body.name);
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    const price = ensureNumber(req.body.price);
    if (price === undefined || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid product price is required",
      });
    }

    const discountPrice = ensureNumber(req.body.discountPrice);
    if (discountPrice !== undefined) {
      if (discountPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount price must be positive",
        });
      }
      if (discountPrice > price) {
        return res.status(400).json({
          success: false,
          message: "Discount price cannot exceed price",
        });
      }
    }

    let categoryId;
    if (req.body.category !== undefined) {
      const categoryDoc = await resolveCategory(req.body.category);
      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      categoryId = categoryDoc._id;
    }

    const stock = ensureNumber(req.body.stock);
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const uploadedImages = collectUploadedImages(req.files);
    const bodyImages = collectBodyImages(req.body);
    const images = Array.from(new Set([...bodyImages, ...uploadedImages]));
    if (!images.length) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    const specifications = normalizeSpecifications(req.body.specifications, req.body);
    const colorVariants = normalizeColorVariants(req.body.colorVariants, req.body);
    const badges = normalizeBadges(req.body.badges, req.body);

    const product = await Product.create({
      name,
      description: trimToUndefined(req.body.description),
      price,
      discountPrice,
      category: categoryId,
      images,
      brand: trimToUndefined(req.body.brand),
      specifications,
      colorVariants,
      stock: stock !== undefined ? stock : undefined,
      badges,
    });

    await product.populate("category", "name slug");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    // Log full error so platform issues are easier to trace in development
    console.error("Create Product Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product slug must be unique",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

const buildProductFilters = async (query) => {
  const filters = { isActive: true };

  const search = trimToUndefined(query.search);
  if (search) {
    filters.name = { $regex: search, $options: "i" };
  }

  const categoryParam = trimToUndefined(query.category);
  if (categoryParam) {
    let categoryId;
    if (mongoose.Types.ObjectId.isValid(categoryParam)) {
      categoryId = categoryParam;
    } else {
      const categoryDoc = await Category.findOne({
        slug: categoryParam.toLowerCase(),
        isActive: true,
      });
      if (categoryDoc) {
        categoryId = categoryDoc._id;
      }
    }

    if (!categoryId) {
      filters._id = { $exists: false };
      return filters;
    }

    filters.category = categoryId;
  }

  const minPrice = ensureNumber(query.minPrice);
  const maxPrice = ensureNumber(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.price = {};
    if (minPrice !== undefined) {
      filters.price.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      filters.price.$lte = maxPrice;
    }
  }

  const badgeFilter = trimToUndefined(query.badge);
  if (badgeFilter && ALLOWED_BADGES.has(badgeFilter.toLowerCase())) {
    filters.badges = badgeFilter.toLowerCase();
  }

  return filters;
};

const getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filters = await buildProductFilters(req.query);

    const [products, total] = await Promise.all([
      Product.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .lean(),
      Product.countDocuments(filters),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: total ? Math.ceil(total / limit) : 0,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const query = { isActive: true };
    if (mongoose.Types.ObjectId.isValid(productId)) {
      query._id = productId;
    } else {
      const slug = trimToUndefined(productId);
      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Invalid product identifier",
        });
      }
      query.slug = slug.toLowerCase();
    }

    const product = await Product.findOne(query)
      .populate("category", "name slug")
      .populate("reviews.user", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let isLoved = false;
    if (req.authUser && req.authUser.uid) {
      const user = await User.findOne({ firebaseUid: req.authUser.uid }, "_id");
      if (user) {
        isLoved = product.likedBy.some((userId) => userId.toString() === user._id.toString());
      }
    }

    return res.status(200).json({
      success: true,
      product,
      isLoved,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (req.body.name !== undefined) {
      const updatedName = trimToUndefined(req.body.name);
      if (!updatedName) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty",
        });
      }
      product.name = updatedName;
    }

    if (req.body.description !== undefined) {
      product.description = trimToUndefined(req.body.description);
    }

    let priceUpdated;
    if (req.body.price !== undefined) {
      const parsedPrice = ensureNumber(req.body.price);
      if (parsedPrice === undefined || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid product price",
        });
      }
      product.price = parsedPrice;
      priceUpdated = parsedPrice;
    }

    if (req.body.discountPrice !== undefined) {
      const parsedDiscount = ensureNumber(req.body.discountPrice);
      if (parsedDiscount !== undefined && parsedDiscount < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount price must be positive",
        });
      }
      const effectivePrice = priceUpdated !== undefined ? priceUpdated : product.price;
      if (parsedDiscount !== undefined && parsedDiscount > effectivePrice) {
        return res.status(400).json({
          success: false,
          message: "Discount price cannot exceed price",
        });
      }
      product.discountPrice = parsedDiscount;
    }

    if (req.body.category !== undefined) {
      const trimmed = trimToUndefined(req.body.category);
      if (!trimmed) {
        product.category = undefined;
      } else {
        const categoryDoc = await resolveCategory(trimmed);
        if (!categoryDoc) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          });
        }
        product.category = categoryDoc._id;
      }
    }

    const uploadedImages = collectUploadedImages(req.files);
    const imagesProvided =
      uploadedImages.length ||
      fieldWasProvided(req.body, "images") ||
      fieldWasProvided(req.body, "existingImages") ||
      fieldWasProvided(req.body, "keepImages");

    if (imagesProvided) {
      const combined = Array.from(new Set([...collectBodyImages(req.body), ...uploadedImages]));
      if (!combined.length) {
        return res.status(400).json({
          success: false,
          message: "Product must retain at least one image",
        });
      }
      product.images = combined;
    }

    if (req.body.brand !== undefined) {
      product.brand = trimToUndefined(req.body.brand);
    }

    if (fieldWasProvided(req.body, "specifications")) {
      product.specifications = normalizeSpecifications(req.body.specifications, req.body);
    }

    if (fieldWasProvided(req.body, "colorVariants")) {
      product.colorVariants = normalizeColorVariants(req.body.colorVariants, req.body);
    }

    if (fieldWasProvided(req.body, "badges")) {
      product.badges = normalizeBadges(req.body.badges, req.body);
    }

    if (req.body.stock !== undefined) {
      const parsedStock = ensureNumber(req.body.stock);
      if (parsedStock !== undefined && parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative",
        });
      }
      product.stock = parsedStock !== undefined ? parsedStock : product.stock;
    }

    if (req.body.isActive !== undefined) {
      product.isActive = Boolean(req.body.isActive);
    }

    await product.save();
    await product.populate("category", "name slug");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product slug must be unique",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

const addProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const parsedRating = ensureNumber(rating);
    if (parsedRating === undefined || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!req.authUser || !req.authUser.uid) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findOne({ firebaseUid: req.authUser.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = product.reviews.find(
      (review) => review.user.toString() === user._id.toString()
    );

    if (existingReview) {
      existingReview.rating = parsedRating;
      existingReview.comment = trimToUndefined(comment);
      existingReview.createdAt = new Date();
    } else {
      product.reviews.push({
        user: user._id,
        rating: parsedRating,
        comment: trimToUndefined(comment),
        createdAt: new Date(),
      });
    }

    recalculateRatings(product);

    await product.save();
    await product.populate("category", "name slug");
    await product.populate("reviews.user", "name email");

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

const toggleProductLove = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    if (!req.authUser || !req.authUser.uid) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findOne({ firebaseUid: req.authUser.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const userId = user._id.toString();
    const likedIndex = product.likedBy.findIndex(
      (userRef) => userRef.toString() === userId
    );

    let loved;
    if (likedIndex >= 0) {
      product.likedBy.splice(likedIndex, 1);
      product.loveCount = Math.max(0, product.loveCount - 1);
      loved = false;
    } else {
      product.likedBy.push(user._id);
      product.loveCount += 1;
      loved = true;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      loved,
      loveCount: product.loveCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle product love",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  toggleProductLove,
};
