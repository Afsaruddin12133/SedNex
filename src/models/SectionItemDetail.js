const mongoose = require("mongoose");

const STATUS_VALUES = ["active", "inactive"];

const contactSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, trim: true },
    direction: { type: String, required: true, trim: true },
    website: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    mapUrl: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const aboutSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    services: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one service is required",
      },
    },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    day: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const sectionItemDetailSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    sectionItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SectionItem",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "active",
    },
    contact: {
      type: contactSchema,
      required: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    about: {
      type: aboutSchema,
      required: true,
    },
    offDaySchedules: {
      type: [scheduleSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SectionItemDetail", sectionItemDetailSchema);
