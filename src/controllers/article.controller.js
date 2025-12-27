const Article = require("../models/article.model");
const User = require("../models/User");

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

    const firebaseUid = req.authUser.uid;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const article = await Article.create({
      category,
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

    const firebaseUid = req.authUser.uid;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only regular users can edit articles",
      });
    }

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
      if (!category || category.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Article category cannot be empty",
        });
      }
      article.category = category;
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
  createArticle,
  updateArticle,
  getArticles,
  getArticleById,
  deleteArticle,
};
