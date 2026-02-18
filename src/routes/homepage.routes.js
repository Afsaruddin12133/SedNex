const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
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
} = require("../controllers/homepage.controller");

const router = express.Router();

router.get(
    "/marquees", 
    getPublicMarquees
);

router.post(
  "/marquees",
  authMiddleware,
  adminMiddleware,
  createMarquee
);

router.patch(
  "/marquees/:marqueeId",
  authMiddleware,
  adminMiddleware,
  updateMarquee
);

router.get(
    "/sliders", 
    getPublicSliders
);

router.post(
  "/sliders",
  authMiddleware,
  adminMiddleware,
  uploadSingleSliderImage,
  createSlider
);

router.patch(
  "/sliders/:sliderId",
  authMiddleware,
  adminMiddleware,
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
  adminMiddleware,
  uploadSingleServiceIcon,
  createServiceCard
);

router.patch(
  "/services/edit/:id",
  authMiddleware,
  adminMiddleware,
  uploadSingleServiceIcon,
  updateServiceCard
);

router.delete(
  "/services/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteServiceCard
);



module.exports = router;
