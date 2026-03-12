const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const goodsUpload = require("../middlewares/goodsUpload");
const {
  createBasicGoods,
  getGoods,
  getGoodsByCategory,
  updateGoods,
  deleteGoods,
} = require("../controllers/goods.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  editorMiddleware,
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
  editorMiddleware,
  goodsUpload.single("icon"),
  updateGoods
);

router.delete(
  "/:goodsId",
  authMiddleware,
  adminMiddleware,
  deleteGoods
);

module.exports = router;
