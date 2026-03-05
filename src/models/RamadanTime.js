const mongoose = require("mongoose");

const ramadanRowSchema = new mongoose.Schema(
  {
    serialNo: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    seheri: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    ifter: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
  },
  { _id: false }
);

const ramadanTimeSchema = new mongoose.Schema(
  {
    rows: {
      type: [ramadanRowSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RamadanTime", ramadanTimeSchema);
