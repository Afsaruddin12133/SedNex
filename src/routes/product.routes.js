const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  toggleProductLove,
} = require("../controllers/product.controller");
const productUpload = require("../middlewares/productUpload");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  productUpload,
  createProduct
);
router.get(
    "/", 
    // authMiddleware,
    getProducts
);
router.get(
    "/:productId", 
    getProductById
);
router.put(
  "/:productId",
  authMiddleware,
  adminMiddleware,
  productUpload,
  updateProduct
);
router.delete(
    "/:productId", 
    authMiddleware, 
    adminMiddleware, 
    deleteProduct
);
router.post(
    "/:productId/review", 
    authMiddleware, 
    addProductReview
);
router.patch(
    "/:productId/love", 
    authMiddleware, 
    toggleProductLove
);

module.exports = router;
