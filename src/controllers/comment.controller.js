const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const firebaseUid = req.authUser.uid;

    if (!content) {
      return res.status(400).json({ message: "Comment content required" });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({ message: "Post not found" });
    }

    // If reply, check parent comment exists
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: user._id,
      content,
      parentComment: parentCommentId || null,
    });
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      post: postId,
      parentComment: null,
      isActive: true,
    })
      .populate("author", "name photo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      post: postId,
      parentComment: null,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;

    const replies = await Comment.find({
      parentComment: commentId,
      isActive: true,
    })
      .populate("author", "name photo")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      replies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch replies",
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  getReplies,
};
