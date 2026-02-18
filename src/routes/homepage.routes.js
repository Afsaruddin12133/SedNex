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

const uploadSingleSliderImage = (req, res, next) => {
  sliderUpload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "You must upload one image at a time",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Image upload failed",
    });
  });
};

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

module.exports = router;
