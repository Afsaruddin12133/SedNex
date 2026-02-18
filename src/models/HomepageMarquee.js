const mongoose = require("mongoose");

const homepageMarqueeSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomepageMarquee", homepageMarqueeSchema);
