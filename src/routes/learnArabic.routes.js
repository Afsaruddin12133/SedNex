const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createWord,
  getCategoryWords,
  updateWord,
  deleteWord,
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

router.patch(
  "/categories/:categoriesid",
  authMiddleware,
  editorMiddleware,
  updateCategory
);

router.delete(
  "/categories/:categoriesid",
  authMiddleware,
  adminMiddleware,
  deleteCategory
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

router.patch(
  "/categories/:slug/words",
  authMiddleware,
  editorMiddleware,
  updateWord
);

router.delete(
  "/categories/:slug/:wordID",
  authMiddleware,
  editorMiddleware,
  deleteWord
);

module.exports = router;
