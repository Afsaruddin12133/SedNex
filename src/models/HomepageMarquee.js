const mongoose = require("mongoose");

const STATUS_VALUES = ["active", "inactive"];

const homepageMarqueeSchema = new mongoose.Schema(
  {
    text: {
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

homepageMarqueeSchema.index({ status: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model("HomepageMarquee", homepageMarqueeSchema);
