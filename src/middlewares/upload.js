import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_profiles",   
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      { width: 300, height: 300, crop: "fill" }
    ],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, 
  },
});

export default upload;
