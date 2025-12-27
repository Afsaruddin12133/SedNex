const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const { createCategory, getCategories } = require("../controllers/category.controller");

const router = express.Router();

router.post(
    "/", 
    authMiddleware, 
    adminMiddleware, 
    createCategory
);
router.get(
    "/", 
    getCategories
);

module.exports = router;
