const Article = require("../models/Article.model");
const ArticaleCategory = require("../models/ArticaleCategory");
const User = require("../models/User");
const slugify = require("../utils/slugify");
const mongoose = require("mongoose");

// ========================
// Create Article
// ========================
const createArticle = async (req, res) => {
  try {
    const { category, title, description } = req.body;

    if (!category || category.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Article category is required",
      });
    }

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Article title is required",
      });
    }

    if (!description || description.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Article description is required",
      });
    }

    const categoryName = category.trim();
    const categorySlug = slugify(categoryName);

    const { userId } = req.authUser;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let existingCategory = null;

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

    const article = await Article.create({
      category: existingCategory._id,
      title,
      description,
      author: user._id,
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

    if (!categoryName || categoryName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const normalizedName = categoryName.trim();
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

    if (name === undefined && isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

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
      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const normalizedName = name.trim();
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
// Update Article
// ========================

const updateArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { category, title, description } = req.body;

    if (
      category === undefined &&
      title === undefined &&
      description === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

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

    if (article.author.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own article",
      });
    }

    if (category !== undefined) {
      if (!category || category.toString().trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Article category cannot be empty",
        });
      }

      let targetCategory = null;
      const categoryValue = category.toString().trim();

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

    if (title !== undefined) {
      if (!title || title.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Article title cannot be empty",
        });
      }
      article.title = title;
    }

    if (description !== undefined) {
      if (!description || description.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Article description cannot be empty",
        });
      }
      article.description = description;
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
  createArticle,
  updateArticle,
  getArticles,
  getArticleById,
  deleteArticle,
};
