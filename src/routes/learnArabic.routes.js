const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createCategory,
  getCategories,
  createWord,
  getCategoryWords,
} = require("../controllers/learnArabic.controller");
const editorMiddleware = require("../middlewares/editor.middleware");

const router = express.Router();

router.post(
  "/categories",
  authMiddleware,
  editorMiddleware,
  createCategory
);

router.get(
  "/categories",
  getCategories
);

router.get(
  "/categories/:slug/words",
  getCategoryWords
);

router.post(
  "/categories/:slug/words",
  authMiddleware,
  editorMiddleware,
  createWord
);

module.exports = router;
