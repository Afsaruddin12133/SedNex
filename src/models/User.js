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
      enum: ["user", "admin", "editor", "guest"],
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

    birthAddress: {
      type: String,
      default: null,
    },
    currentAddress: {
      type: String,
      default: null,
    },
    birthDate: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
    maritalStatus: {
      type: String,
      default: null,
    },
    nationality: {
      type: String,
      default: null,
    },
    bloodGroup: {
      type: String,
      default: null,
    },
    jobTitle: {
      type: String,
      default: null,
    },
    companyName: {
      type: String,
      default: null,
    },
    workAddress: {
      type: String,
      default: null,
    },
    websiteLink: {
      type: String,
      default: null,
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
    warnings: [
      {
        message: {
          type: String,
          required: true,
          trim: true,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
