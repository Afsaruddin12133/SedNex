const mongoose = require("mongoose");

const busFlightSchema = new mongoose.Schema(
  {
    airlineName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    airlineImage: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusFlight", busFlightSchema);
