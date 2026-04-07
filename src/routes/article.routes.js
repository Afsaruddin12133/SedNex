const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const articleUpload = require("../middlewares/articleUpload");
const {
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
} = require("../controllers/article.controller");
const {
    toggleSaveArticle,
    getSavedArticles,
} = require("../controllers/savedArticle.controller");

const router = express.Router();

router.post(
    "/", 
    authMiddleware,
    editorMiddleware,
    articleUpload.array("images", 10),
    createArticle,
);

router.post(
    "/category", 
    authMiddleware,
    editorMiddleware,
    createCategoryArticle,
);

router.get(
    "/category",
    getCategoryArticle,
);

router.get(
    "/category/:categoryId",
    getCategoryArticleById,
);

router.delete(
    "/category/:categoryId",
    authMiddleware,
    editorMiddleware,
    deleteCategoryArticle,
);

router.get(
    "/",
    // authMiddleware,
    getArticles,
);

router.get(
    "/saved",
    authMiddleware,
    getSavedArticles
);

router.get(
    "/:articleId",
    // authMiddleware,
    getArticleById,
);

router.patch(
    "/category/:category",
    authMiddleware,
    editorMiddleware,
    updateCategoryArticle,
);

router.patch(
    "/:articleId",
    authMiddleware,
    editorMiddleware,
    articleUpload.array("images", 10),
    updateArticle,
);

router.delete(
    "/:articleId",
    authMiddleware,
    adminMiddleware,
    deleteArticle,
);

router.post(
    "/:articleId/save",
     authMiddleware, 
     toggleSaveArticle
);

module.exports = router;
