const mongoose = require("mongoose");

const localTourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    info: {
      date: {
        type: String,
        required: true,
        trim: true,
      },
      distance: {
        type: String,
        required: true,
        trim: true,
      },
      duration: {
        type: String,
        required: true,
        trim: true,
      },
      ticketPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      ticketPriceTag: {
        type: String,
        trim: true,
      },
      begins: {
        type: String,
        required: true,
        trim: true,
      },
      returnTime: {
        type: String,
        required: true,
        trim: true,
      },
    },
    includedWithTickets: {
      type: [String],
      default: [],
    },
    locationDetails: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LocalTour", localTourSchema);
