const mongoose = require("mongoose");

const localTourSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      trim: true,
    },
    info: {
      date: {
        type: String,
        trim: true,
      },
      distance: {
        type: String,
        trim: true,
      },
      duration: {
        type: String,
        trim: true,
      },
      ticketPrice: {
        type: Number,
        min: 0,
      },
      ticketPriceTag: {
        type: String,
        trim: true,
      },
      begins: {
        type: String,
        trim: true,
      },
      returnTime: {
        type: String,
        trim: true,
      },
    },
    includedWithTickets: {
      type: [String],
      default: [],
    },
    locationDetails: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    privacyPolicyUrl: {
      type: String,
      trim: true,
    },
    tourStatus: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["running", "completed", "upcoming"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LocalTour", localTourSchema);
