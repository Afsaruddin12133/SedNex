const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { createArticle } = require("../controllers/article.controller");
const { toggleSaveArticle } = require("../controllers/savedArticle.controller");

const router = express.Router();

router.post(
    "/", 
    authMiddleware,
    createArticle,
);

router.post(
    "/:articleId/save",
     authMiddleware, 
     toggleSaveArticle
);
module.exports = router;
