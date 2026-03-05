const mongoose = require("mongoose");

const busServiceSchema = new mongoose.Schema(
  {
    busName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    busImage: {
      type: String,
      required: true,
      trim: true,
    },
    busSitNo: {
      type: Number,
      required: true,
      min: 1,
    },
    rentalDetails: {
      type: [String],
      required: true,
      default: [],
    },
    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    aboutBusServices: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusService", busServiceSchema);
