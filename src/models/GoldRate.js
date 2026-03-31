const mongoose = require("mongoose");

const goldRateSchema = new mongoose.Schema(
  {
    carat: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoldRate", goldRateSchema);
