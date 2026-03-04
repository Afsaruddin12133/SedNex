const mongoose = require("mongoose");

const flightRouteSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    via: {
      type: [String],
      default: [],
    },
    to: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlightRoute", flightRouteSchema);
