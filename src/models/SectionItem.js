const mongoose = require("mongoose");

const STATUS_VALUES = ["active", "inactive"];

const sectionItemSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
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

sectionItemSchema.index({ sectionId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("SectionItem", sectionItemSchema);
