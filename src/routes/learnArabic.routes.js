const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const {
  createCategory,
  getCategories,
  createWord,
  getCategoryWords,
} = require("../controllers/learnArabic.controller");

const router = express.Router();

router.post(
  "/categories",
  authMiddleware,
  adminMiddleware,
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
  adminMiddleware,
  createWord
);

module.exports = router;
