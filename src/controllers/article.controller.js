const Article = require("../models/Article.model");
const ArticaleCategory = require("../models/ArticaleCategory");
const User = require("../models/User");
const slugify = require("../utils/slugify");
const mongoose = require("mongoose");
const { safeCreateGlobalNotification } = require("../services/notification.service");

const parseArticleContentInput = (content) => {
  if (content === undefined) {
    return { value: undefined };
  }

  if (content === null) {
    return { error: "Content must be an array" };
  }

  if (Array.isArray(content)) {
    return { value: content };
  }

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed.length) {
      return { value: [] };
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        return { error: "Content must be an array" };
      }
      return { value: parsed };
    } catch (error) {
      return { error: "Content must be a valid JSON array" };
    }
  }

  return { error: "Content must be an array" };
};

const getUploadedImageUrls = (req) => {
  const files = Array.isArray(req.files) ? req.files : [];
  return files
    .map((file) => file?.path || file?.secure_url)
    .filter((url) => typeof url === "string" && url.trim().length > 0);
};

const applyUploadedImagesToContent = (content, imageUrls) => {
  if (!imageUrls.length) {
    return { content };
  }

  const imageBlocks = content.filter((block) => block && block.type === "image");
  if (imageBlocks.length !== imageUrls.length) {
    return {
      error: "Number of uploaded images must match number of image blocks",
    };
  }

  let imageIndex = 0;
  const merged = content.map((block) => {
    if (block && block.type === "image") {
      const url = imageUrls[imageIndex++];
      return {
        ...block,
        url,
      };
    }
    return block;
  });

  return { content: merged };
};

const normalizeArticleContent = (content) => {
  if (!Array.isArray(content) || content.length === 0) {
    return {
      error: "Content must be a non-empty array",
    };
  }

  const normalized = content.map((block, index) => {
    if (!block || typeof block !== "object") {
      return {
        error: `Content block ${index + 1} must be an object`,
      };
    }

    const { type, data, url } = block;

    if (type !== "paragraph" && type !== "image") {
      return {
        error: `Content block ${index + 1} has invalid type`,
      };
    }

    if (type === "paragraph") {
      if (typeof data !== "string" || data.trim() === "") {
        return {
          error: `Content block ${index + 1} paragraph data is required`,
        };
      }

      return {
        type,
        data: data.trim(),
      };
    }

    if (typeof url !== "string" || url.trim() === "") {
      return {
        error: `Content block ${index + 1} image url is required`,
      };
    }

    return {
      type,
      url: url.trim(),
    };
  });

  const errorBlock = normalized.find((block) => block && block.error);
  if (errorBlock) {
    return errorBlock;
  }

  return { normalized };
};

// ========================
// Create Article
// ========================
const createArticle = async (req, res) => {
  try {
    const body = req.body || {};
    const { category, title, description, content } = body;

    const parsedContent = parseArticleContentInput(content);
    if (parsedContent.error) {
      return res.status(400).json({
        success: false,
        message: parsedContent.error,
      });
    }

    let normalizedContent = parsedContent.value;
    if (normalizedContent === undefined && typeof description === "string") {
      const trimmedDescription = description.trim();
      if (trimmedDescription) {
        normalizedContent = [
          {
            type: "paragraph",
            data: trimmedDescription,
          },
        ];
      }
    }
    const uploadedImageUrls = getUploadedImageUrls(req);

    if (normalizedContent === undefined && uploadedImageUrls.length) {
      normalizedContent = uploadedImageUrls.map((url) => ({
        type: "image",
        url,
      }));
    }

    if (normalizedContent === undefined) {
      normalizedContent = [];
    }

    let contentToSave = [];
    if (normalizedContent.length) {
      const hasImageBlocks = normalizedContent.some(
        (block) => block && block.type === "image"
      );
      let mergedContent = normalizedContent;

      if (uploadedImageUrls.length) {
        if (hasImageBlocks) {
          const merged = applyUploadedImagesToContent(
            normalizedContent,
            uploadedImageUrls
          );
          if (merged.error) {
            return res.status(400).json({
              success: false,
              message: merged.error,
            });
          }
          mergedContent = merged.content;
        } else {
          mergedContent = normalizedContent.concat(
            uploadedImageUrls.map((url) => ({ type: "image", url }))
          );
        }
      }

      const contentResult = normalizeArticleContent(mergedContent);
      if (contentResult.error) {
        return res.status(400).json({
          success: false,
          message: contentResult.error,
        });
      }

      contentToSave = contentResult.normalized;
    }

    const categoryName =
      category !== undefined && category !== null ? String(category).trim() : "";
    const categorySlug = categoryName ? slugify(categoryName) : "";

    const { userId } = req.authUser;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let existingCategory = null;

    if (categoryName) {
      if (mongoose.Types.ObjectId.isValid(categoryName)) {
        existingCategory = await ArticaleCategory.findById(categoryName);
      }

      if (!existingCategory) {
        existingCategory = await ArticaleCategory.findOne({
          $or: [{ name: categoryName }, { slug: categorySlug }],
        });
      }

      if (!existingCategory) {
        existingCategory = await ArticaleCategory.create({
          name: categoryName,
          isActive: true,
        });
      }
    }

    const article = await Article.create({
      category: existingCategory ? existingCategory._id : undefined,
      title,
      description: typeof description === "string" ? description.trim() : undefined,
      content: contentToSave,
      author: user._id,
    });

    await safeCreateGlobalNotification({
      title: "New article posted",
      message: `Article: ${article.title}`,
      type: "article",
      entityType: "article",
      entityId: article._id,
    });

    return res.status(201).json({
      success: true,
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    console.error("Create Article Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create article",
    });
  }
};

// ========================
// Create Category For Articles
// ========================
const createCategoryArticle = async (req, res) => {
  try {
    const { name, category, isActive } = req.body;
    const categoryName = name || category;

    if(categoryName === undefined) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const normalizedName =
      categoryName !== undefined && categoryName !== null
        ? String(categoryName).trim()
        : "";
    const categorySlug = slugify(normalizedName);

    const exists = await ArticaleCategory.findOne({
      $or: [{ name: normalizedName }, { slug: categorySlug }],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const newCategory = new ArticaleCategory({
      name: normalizedName,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category slug must be unique",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// ========================
// Get Article Categories
// ========================
const getCategoryArticle = async (req, res) => {
  try {
    const categories = await ArticaleCategory.find()
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      total: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// ========================
// Get Article Category By Id
// ========================
const getCategoryArticleById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    const category = await ArticaleCategory.findById(categoryId).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

// ========================
// Update Article Category
// ========================
const updateCategoryArticle = async (req, res) => {
  try {
    const { category } = req.params;
    const { name, isActive } = req.body;


    let existingCategory = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
      existingCategory = await ArticaleCategory.findById(category);
    }

    if (!existingCategory) {
      const normalizedCategory = category.toString().trim();
      const categorySlug = slugify(normalizedCategory);
      existingCategory = await ArticaleCategory.findOne({
        $or: [{ name: normalizedCategory }, { slug: categorySlug }],
      });
    }

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name !== undefined) {
      const normalizedName = String(name).trim();
      const nameSlug = slugify(normalizedName);

      const duplicate = await ArticaleCategory.findOne({
        _id: { $ne: existingCategory._id },
        $or: [{ name: normalizedName }, { slug: nameSlug }],
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
        });
      }

      existingCategory.name = normalizedName;
    }

    if (isActive !== undefined) {
      existingCategory.isActive = Boolean(isActive);
    }

    await existingCategory.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: existingCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category slug must be unique",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// ========================
// Delete Article Category
// ========================
const deleteCategoryArticle = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    const category = await ArticaleCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await ArticaleCategory.findByIdAndDelete(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Article Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

// ========================
// Update Article
// ========================

const updateArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { category, title, description, content } = req.body;


    const { userId } = req.authUser;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // if (user.role !== "user") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Only regular users can edit articles",
    //   });
    // }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (category !== undefined) {
      const categoryValue =
        category !== null && category !== undefined
          ? category.toString().trim()
          : "";

      if (!categoryValue) {
        article.category = undefined;
      } else {
        let targetCategory = null;

        if (mongoose.Types.ObjectId.isValid(categoryValue)) {
          targetCategory = await ArticaleCategory.findById(categoryValue);
        }

        if (!targetCategory) {
          const categorySlug = slugify(categoryValue);
          targetCategory = await ArticaleCategory.findOne({
            $or: [{ name: categoryValue }, { slug: categorySlug }],
          });
        }

        if (!targetCategory) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          });
        }

        article.category = targetCategory._id;
      }
    }

    if (title !== undefined) {
      article.title = typeof title === "string" ? title.trim() : title;
    }

    if (description !== undefined) {
      article.description =
        typeof description === "string" ? description.trim() : description;
    }

    if (content !== undefined) {
      const parsedContent = parseArticleContentInput(content);
      if (parsedContent.error) {
        return res.status(400).json({
          success: false,
          message: parsedContent.error,
        });
      }

      let normalizedContent = parsedContent.value ?? [];
      const uploadedImageUrls = getUploadedImageUrls(req);
      const hasImageBlocks = normalizedContent.some(
        (block) => block && block.type === "image"
      );
      let mergedContent = normalizedContent;

      if (uploadedImageUrls.length) {
        if (hasImageBlocks) {
          const merged = applyUploadedImagesToContent(
            normalizedContent,
            uploadedImageUrls
          );
          if (merged.error) {
            return res.status(400).json({
              success: false,
              message: merged.error,
            });
          }
          mergedContent = merged.content;
        } else {
          mergedContent = normalizedContent.concat(
            uploadedImageUrls.map((url) => ({ type: "image", url }))
          );
        }
      }

      if (mergedContent.length) {
        const contentResult = normalizeArticleContent(mergedContent);
        if (contentResult.error) {
          return res.status(400).json({
            success: false,
            message: contentResult.error,
          });
        }
        article.content = contentResult.normalized;
      } else {
        article.content = [];
      }
    }

    await article.save();

    return res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article,
    });
  } catch (error) {
    console.error("Update Article Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update article",
    });
  }
};

// ========================
// Get All Articles
// ========================

const getArticles = async (req, res) => {
  try {

    const articles = await Article.find().populate("author", "name email role");

    return res.status(200).json({
      success: true,
      total: articles.length,
      articles,
    });
  } catch (error) {
    console.error("Get Articles Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch articles",
    });
  }
};

// ========================
// Get Article By Id
// ========================

const getArticleById = async (req, res) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findById(articleId).populate(
      "author",
      "name email role"
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    return res.status(200).json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("Get Article Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch article",
    });
  }
};

// ========================
// Delete Article
// ========================

const deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    await Article.findByIdAndDelete(articleId);

    return res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Delete Article Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete article",
    });
  }
};

module.exports = {
  createCategoryArticle,
  getCategoryArticle,
  getCategoryArticleById,
  updateCategoryArticle,
  deleteCategoryArticle,
  createArticle,
  updateArticle,
  getArticles,
  getArticleById,
  deleteArticle,
};
