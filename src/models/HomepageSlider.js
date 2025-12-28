const mongoose = require("mongoose");

const STATUS_VALUES = ["active", "inactive"];

const homepageSliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
    },
    buttonUrl: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "active",
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

homepageSliderSchema.index({ status: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model("HomepageSlider", homepageSliderSchema);
