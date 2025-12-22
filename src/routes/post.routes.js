const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { createPost, getPosts, toggleLove, getPostById, deletePost, getPostsByCategory } = require("../controllers/post.controller");
const { createComment, getPostComments, getReplies } = require("../controllers/comment.controller");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();
// ========================
// Create Posts 
// ========================

router.post(
    "/", 
    authMiddleware, 
    createPost
);
// ========================
// Get Posts with Pagination
// ========================
router.get(
    "/", 
    authMiddleware, 
    getPosts
);

// ========================
// Get Posts By Id
// ========================
router.get(
    "/:postId",
    authMiddleware,
    getPostById
);
// ========================
// Get Posts By category
// ========================
router.get(
    "/category/:category",
    authMiddleware,
    getPostsByCategory
);

// ========================
// Delete Posts By ID
// ========================

router.delete(
    "/:postId", 
     authMiddleware, 
    adminMiddleware,
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
    authMiddleware,
    getPostComments
);
router.get(
    "/comment/replies/:commentId",
    authMiddleware,
    getReplies
);

module.exports = router;