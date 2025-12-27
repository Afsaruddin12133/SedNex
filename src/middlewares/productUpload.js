const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const ALLOWED_FIELD_PREFIXES = ["images", "image"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});

const isAllowedField = (fieldName) => {
  if (!fieldName) {
    return false;
  }
  return ALLOWED_FIELD_PREFIXES.some((prefix) => fieldName === prefix || fieldName.startsWith(`${prefix}[`));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3,
  },
  fileFilter: (req, file, cb) => {
    if (isAllowedField(file.fieldname)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

const productUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Each image must be less than 5MB",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message: "You can upload up to 3 images per product",
          });
        }
      }
      return next(err);
    }

    const acceptedFiles = (req.files || []).filter((file) => isAllowedField(file.fieldname));
    req.files = acceptedFiles;
    return next();
  });
};

module.exports = productUpload;
