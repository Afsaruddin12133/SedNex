const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const {
  uploadSingleSliderImage,
  uploadSingleServiceIcon,
} = require("../middlewares/homepageUploads");
const {
  createMarquee,
  getPublicMarquees,
  updateMarquee,
  createSlider,
  getPublicSliders,
  updateSlider,
  deleteSlider,
  createServiceCard,
  updateServiceCard,
  deleteServiceCard,
  getServiceCards,
  createGoldRate,
  updateGoldRate,
  deleteGoldRate,
  getGoldRates,
} = require("../controllers/homepage.controller");

const router = express.Router();

router.get(
    "/marquees", 
    getPublicMarquees
);

router.post(
  "/marquees",
  authMiddleware,
  editorMiddleware,
  createMarquee
);

router.patch(
  "/marquees/:marqueeId",
  authMiddleware,
  editorMiddleware,
  updateMarquee
);

router.get(
    "/sliders", 
    getPublicSliders
);

router.post(
  "/sliders",
  authMiddleware,
  editorMiddleware,
  uploadSingleSliderImage,
  createSlider
);

router.patch(
  "/sliders/:sliderId",
  authMiddleware,
  editorMiddleware,
  uploadSingleSliderImage,
  updateSlider
);

router.delete(
  "/sliders/:sliderId",
  authMiddleware,
  adminMiddleware,
  deleteSlider
);

router.get(
  "/services",
  getServiceCards
);

router.post(
  "/services/create",
  authMiddleware,
  editorMiddleware,
  uploadSingleServiceIcon,
  createServiceCard
);

router.patch(
  "/services/edit/:id",
  authMiddleware,
  editorMiddleware,
  uploadSingleServiceIcon,
  updateServiceCard
);

router.delete(
  "/services/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteServiceCard
);

router.get(
  "/gold-rate",
  getGoldRates
);

router.post(
  "/gold-rate",
  authMiddleware,
  editorMiddleware,
  createGoldRate
);

router.patch(
  "/gold-rate/:id",
  authMiddleware,
  editorMiddleware,
  updateGoldRate
);

router.delete(
  "/gold-rate/:id",
  authMiddleware,
  adminMiddleware,
  deleteGoldRate
);



module.exports = router;
