const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const { createArticle, updateArticle, getArticles, getArticleById, deleteArticle } = require("../controllers/article.controller");
const { toggleSaveArticle } = require("../controllers/savedArticle.controller");

const router = express.Router();

router.post(
    "/", 
    authMiddleware,
    createArticle,
);

router.get(
    "/",
    authMiddleware,
    getArticles,
);

router.get(
    "/:articleId",
    authMiddleware,
    getArticleById,
);

router.patch(
    "/:articleId",
    authMiddleware,
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
