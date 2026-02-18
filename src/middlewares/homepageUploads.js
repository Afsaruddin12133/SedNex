const sliderUpload = require("./sliderUpload");
const serviceUpload = require("./serviceUpload");

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

const uploadSingleServiceIcon = (req, res, next) => {
  serviceUpload.single("icon")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "You must upload one icon at a time",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Icon upload failed",
    });
  });
};

module.exports = {
  uploadSingleSliderImage,
  uploadSingleServiceIcon,
};
