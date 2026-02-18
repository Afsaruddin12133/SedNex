const mongoose = require("mongoose");

const serviceCardSchema = new mongoose.Schema({
  icon: {
    type: String,
    trim: true,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
  },
  time: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

module.exports = mongoose.model("ServiceCard", serviceCardSchema);
