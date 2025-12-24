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

module.exports = {
  createArticle,
};
