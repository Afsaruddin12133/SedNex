const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const goodsUpload = require("../middlewares/goodsUpload");
const {
  createBasicGoods,
  getGoods,
  getGoodsByCategory,
  updateGoods,
} = require("../controllers/goods.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  goodsUpload.single("icon"),
  createBasicGoods
);

router.get(
  "/",
  getGoods
);

router.get(
  "/:category",
  getGoodsByCategory
);

router.patch(
  "/:goodsId",
  authMiddleware,
  adminMiddleware,
  goodsUpload.single("icon"),
  updateGoods
);

module.exports = router;
