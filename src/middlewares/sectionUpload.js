const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sections",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const sectionUpload = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});

module.exports = sectionUpload;
