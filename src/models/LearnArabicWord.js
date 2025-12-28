const mongoose = require("mongoose");

const STATUS_VALUES = ["active", "inactive"];

const learnArabicWordSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearnArabicCategory",
      required: true,
      index: true,
    },
    english: {
      type: String,
      required: true,
      trim: true,
    },
    arabic: {
      type: String,
      required: true,
      trim: true,
    },
    pronunciation: {
      type: String,
      trim: true,
    },
    transliteration: {
      type: String,
      trim: true,
    },
    example: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "active",
    },
  },
  { timestamps: true }
);

learnArabicWordSchema.index({ categoryId: 1, english: 1 }, { unique: true });

module.exports = mongoose.model("LearnArabicWord", learnArabicWordSchema);
