const { required } = require("joi");
const mongoose = require("mongoose");

const goodsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    pricetag: {
      type: String,
      required: true,
      trim: true, 
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goods", goodsSchema);
