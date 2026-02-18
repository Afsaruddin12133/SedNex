const SavedPost = require("../models/savedPost.model");
const Post = require("../models/Post");
const User = require("../models/User");

const toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.authUser.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot save your own post",
      });
    }

    const existingSave = await SavedPost.findOne({
      user: user._id,
      post: postId,
    });

    if (existingSave) {
      await existingSave.deleteOne();

      return res.status(200).json({
        success: true,
        saved: false,
        message: "Post unsaved successfully",
      });
    }

    await SavedPost.create({
      user: user._id,
      post: postId,
    });

    return res.status(201).json({
      success: true,
      saved: true,
      message: "Post saved successfully",
    });
  } catch (error) {
    console.error("Toggle Save Post Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save post",
    });
  }
};

module.exports = {
  toggleSavePost,
};
