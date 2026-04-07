const { required } = require("joi");
const mongoose = require("mongoose");

const goodsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    pricetag: {
      type: String,
      trim: true, 
    },
    icon: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goods", goodsSchema);
