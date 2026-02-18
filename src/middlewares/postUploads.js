const postUpload = require("./postUpload");

const uploadPostImages = (req, res, next) => {
  postUpload.array("images", 4)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "You must upload between 1 and 4 images at a time",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Image upload failed",
    });
  });
};

module.exports = {
  uploadPostImages,
};
