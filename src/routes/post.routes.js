const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { uploadPostImages } = require("../middlewares/postUploads");
const { createPost, getPosts, toggleLove, getPostById, deletePost, getPostsByCategory, updatePost, getMyPosts, updatePostCompletion } = require("../controllers/post.controller");
const { createComment, getPostComments, getReplies } = require("../controllers/comment.controller");
const { toggleSavePost, getSavedPosts } = require("../controllers/savedPost.controller");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();
// ========================
// Create Posts 
// ========================

router.post(
    "/", 
    authMiddleware, 
    uploadPostImages,
    createPost
);
// ========================
// Get Posts with Pagination
// ========================
router.get(
    "/",  
    getPosts
);

// ========================
// Get Posts By Id
// ========================

router.get(
    "/me",
    authMiddleware,
    getMyPosts
);

router.get(
    "/saved",
    authMiddleware,
    getSavedPosts
);

router.get(
    "/:postId",
    getPostById
);
// ========================
// Update Post By Id
// ========================
router.patch(
    "/:postId",
    authMiddleware,
    uploadPostImages,
    updatePost
);

// ========================
// Update Post Completion State
// ========================
router.patch(
    "/:postId/completion",
    authMiddleware,
    updatePostCompletion
);
// ========================
// Get Posts By category
// ========================
router.get(
    "/category/:category",
    getPostsByCategory
);

router.post(
    "/save/:postId",
    authMiddleware,
    toggleSavePost
)

// ========================
// Delete Posts By ID
// ========================

router.delete(
    "/:postId", 
     authMiddleware, 
    deletePost
);

// ========================
// Posts Love and Unlove
// ========================

router.patch(
    "/:postId/love", 
    authMiddleware, 
    toggleLove
);

// ========================
// Posts comment
// ========================

router.post(
    "/comment/:postId", 
    authMiddleware, 
    createComment
);

router.get(
    "/comment/:postId", 
    getPostComments
);
router.get(
    "/comment/replies/:commentId",
    authMiddleware,
    getReplies
);

module.exports = router;