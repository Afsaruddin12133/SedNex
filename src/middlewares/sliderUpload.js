const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "homepage_sliders",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1920, height: 1080, crop: "limit" }],
  },
});

const sliderUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = sliderUpload;
