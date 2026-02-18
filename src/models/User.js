const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    country: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "guest"],
      default: "user",
    },
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
      default: null
    },

    phone: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    resetPasswordOtp: {
      type: String,
      select: false,
    },
    resetPasswordOtpExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
