const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
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
const { toggleSaveArticle } = require("../controllers/savedArticle.controller");

const router = express.Router();

router.post(
    "/", 
    authMiddleware,
    editorMiddleware,
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
