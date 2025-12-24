const SavedArticle = require("../models/savedArticle.model");
const Article = require("../models/article.model");
const User = require("../models/User");


const toggleSaveArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    const firebaseUid = req.authUser.uid;
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    const existingSave = await SavedArticle.findOne({
      user: user._id,
      article: articleId,
    });

    if (existingSave) {
      await existingSave.deleteOne();

      return res.status(200).json({
        success: true,
        saved: false,
        message: "Article unsaved successfully",
      });
    }

    await SavedArticle.create({
      user: user._id,
      article: articleId,
    });

    return res.status(201).json({
      success: true,
      saved: true,
      message: "Article saved successfully",
    });
  } catch (error) {
    console.error("Toggle Save Article Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save article",
    });
  }
};

module.exports = {
  toggleSaveArticle,
};
