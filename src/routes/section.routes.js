const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
// const editorMiddleware = require("../middlewares/editor.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const sectionUpload = require("../middlewares/sectionUpload");
const {
  createSection,
  updateSection,
  deleteSection,
  getSections,
  getSectionItems,
  getSectionItemsAdmin,
  createSectionItem,
  updateSectionItem,
  deleteSectionItem,
} = require("../controllers/section.controller");
const {
  createSectionItemDetail,
  getSectionItemDetails,
  getSectionItemDetailsAdmin,
  updateSectionItemDetail,
  deleteSectionItemDetail,
} = require("../controllers/sectionDetail.controller");
const editorMiddleware = require("../middlewares/editor.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  editorMiddleware,
  createSection
);

router.patch(
  "/:sectionId",
  authMiddleware,
  editorMiddleware,
  updateSection
);
router.delete(
  "/:sectionId",
  authMiddleware,
  adminMiddleware,
  deleteSection
)

router.get(
    "/", 
    getSections
);
router.get(
  "/:slug/items",
  authMiddleware,
  getSectionItemsAdmin
);

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
  editorMiddleware,
  sectionUpload.single("image"),
  createSectionItem
);

router.patch(
  "/:slug/items/:itemId",
  authMiddleware,
  editorMiddleware,
  sectionUpload.single("image"),
  updateSectionItem
);

router.delete(
  "/:slug/items/:itemId",
  authMiddleware,
  editorMiddleware,
  deleteSectionItem
);


router.post(
  "/:slug/items/:itemId/details",
  authMiddleware,
  editorMiddleware,
  sectionUpload.single("coverPhoto"),
  createSectionItemDetail
);

router.patch(
  "/:slug/items/:itemId/details/:detailId",
  authMiddleware,
  editorMiddleware,
  sectionUpload.single("coverPhoto"),
  updateSectionItemDetail
);

router.delete(
  "/:slug/items/:itemId/details/:detailId",
  authMiddleware,
  editorMiddleware,
  deleteSectionItemDetail
);

module.exports = router;
