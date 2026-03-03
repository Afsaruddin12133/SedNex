const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const { createCategory, getCategories } = require("../controllers/category.controller");

const router = express.Router();

router.post(
    "/", 
    authMiddleware, 
    editorMiddleware, 
    createCategory
);
router.get(
    "/", 
    getCategories
);

module.exports = router;
