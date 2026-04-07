const mongoose = require("mongoose");

const busServiceSchema = new mongoose.Schema(
  {
    busName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    busImage: {
      type: String,
      trim: true,
    },
    busSitNo: {
      type: Number,
      min: 1,
    },
    rentalDetails: {
      type: [String],
      default: [],
    },
    note: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    aboutBusServices: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusService", busServiceSchema);
