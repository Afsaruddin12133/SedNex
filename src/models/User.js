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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
