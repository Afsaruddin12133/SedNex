const mongoose = require("mongoose");

const busFlightSchema = new mongoose.Schema(
  {
    airlineName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    airlineImage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusFlight", busFlightSchema);
