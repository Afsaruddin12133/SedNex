const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const sectionUpload = require("../middlewares/sectionUpload");
const {
  createSection,
  getSections,
  getSectionItems,
  getSectionItemsAdmin,
  createSectionItem,
} = require("../controllers/section.controller");
const {
  createSectionItemDetail,
  getSectionItemDetails,
  getSectionItemDetailsAdmin,
} = require("../controllers/sectionDetail.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createSection
);

router.get(
    "/", 
    getSections
);
router.get(
  "/:slug/items",
  authMiddleware,
  getSectionItemsAdmin
);
// router.get(
//   "/:slug/items/:itemId/details/admin",
//   authMiddleware,
//   adminMiddleware,
//   getSectionItemDetailsAdmin
// );
router.get(
  "/:slug/items/:itemId/details",
  getSectionItemDetails
);
router.get(
    "/:slug/items", 
    getSectionItems
);
router.post(
  "/:slug/items",
  authMiddleware,
  adminMiddleware,
  sectionUpload.single("image"),
  createSectionItem
);
router.post(
  "/:slug/items/:itemId/details",
  authMiddleware,
  adminMiddleware,
  createSectionItemDetail
);

module.exports = router;
