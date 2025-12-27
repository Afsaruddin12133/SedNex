const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

// ========================
// Create Post
// ========================
const createPost = async (req, res) => {
  try {
    const { description,category } = req.body;
    const lowerCategory = category.toLowerCase();

    if (!description || description.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Post description is required",
      });
    }

    // Get authenticated user from middleware
    const firebaseUid = req.authUser.uid;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const post = await Post.create({
      author: user._id,
      category: lowerCategory,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
};


// ========================
// Get Posts with Pagination
// ========================
const getPosts = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments({ isActive: true });

    const posts = await Post.find({ isActive: true })
      .populate("author", "name email role") 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

// ========================
// Toggle Love Reaction
// ========================
const toggleLove = async (req, res) => {
  try {
    const { postId } = req.params;
    const firebaseUid = req.authUser.uid;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLoved = post.lovedBy.includes(user._id);

    if (alreadyLoved) {
      post.lovedBy.pull(user._id);
    } else {
      post.lovedBy.push(user._id);
    }

    post.loveCount = post.lovedBy.length;
    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLoved ? "Post unloved" : "Post loved",
      loveCount: post.loveCount,
      isLoved: !alreadyLoved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle love reaction",
    });
  }
};
// ========================
// Get Post By Id
// ========================

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    

    const post = await Post.findOne({
      _id: postId,
      isActive: true,
    }).populate("author", "name email photo role");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
    });
  }
};


const getPostsByCategory = async (req, res) => {
  
  try {
    const { category } = req.params;
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      category,
      isActive: true,
    })
      .populate("author", "name email photo role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({
      category,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      category,
      page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts by category",
    });
  }
};

// ========================
// delete Post By Id
// ========================

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const firebaseUid = req.authUser.uid;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({ message: "Post not found" });
    }


    const isAdmin = user.role === "admin";
    const isOwner = post.author.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "You are not allowed to delete this post",
      });
    }

    await Post.findByIdAndDelete(postId);

    await Comment.deleteMany({ post: postId });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};

// ========================
// Update Post
// ========================

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { description, category } = req.body;

    if (
      (description === undefined || description === null) &&
      (category === undefined || category === null)
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
        message: "Only regular users can edit posts",
      });
    }

    const post = await Post.findById(postId);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own post",
      });
    }

    if (description !== undefined) {
      if (!description || description.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Post description cannot be empty",
        });
      }
      post.description = description;
    }

    if (category !== undefined) {
      if (!category || category.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Post category cannot be empty",
        });
      }
      post.category = category.toLowerCase();
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update post",
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLove,
  getPostById,
  deletePost,
  getPostsByCategory,
  updatePost,
};
