const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    email: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: false,
    },
    country: {
      type: String,
      required: false,
    },

    photo: String,
    role: {
      type: String,
      enum: ["user", "admin", "guest"],
      default: "user",
    },
    provider: String,
    isActive: {
      type: Boolean,
      default: true,
    },
     profileImage: {
      type: String,
      default: null, // Cloudinary URL
    },
    bio: {
      type: String,
      maxLength: 200,
    },

    phone: {
      type: String,
    },

    location: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
