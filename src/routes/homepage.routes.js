const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const sliderUpload = require("../middlewares/sliderUpload");
const {
  createMarquee,
  getPublicMarquees,
  getMarqueesAdmin,
  updateMarquee,
  createSlider,
  getPublicSliders,
  getSlidersAdmin,
  updateSlider,
  deleteSlider,
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
  sliderUpload.single("image"),
  createSlider
);

router.patch(
  "/sliders/:sliderId",
  authMiddleware,
  adminMiddleware,
  sliderUpload.single("image"),
  updateSlider
);

router.delete(
  "/sliders/:sliderId",
  authMiddleware,
  adminMiddleware,
  deleteSlider
);

module.exports = router;
