const mongoose = require("mongoose");

const STATUS_VALUES = ["active", "inactive"];

const contactSchema = new mongoose.Schema(
  {
    mobile: { type: String, trim: true },
    direction: { type: String, trim: true },
    website: { type: String, trim: true },
    email: { type: String, trim: true },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true },
    mapUrl: { type: String, trim: true },
  },
  { _id: false }
);

const aboutSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true },
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
    day: { type: String, trim: true },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const topOfficialSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    position: { type: String, trim: true },
  },
  { _id: false }
);

const socialMediaSchema = new mongoose.Schema(
  {
    facebook: { type: String, trim: true },
    youtube: { type: String, trim: true },
    twitter: { type: String, trim: true },
    x: { type: String, trim: true },
  },
  { _id: false }
);

const sectionItemDetailSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      index: true,
    },
    sectionItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SectionItem",
      index: true,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "active",
    },
    contact: {
      type: contactSchema,
    },
    location: {
      type: locationSchema,
    },
    about: {
      type: aboutSchema,
    },
    coverPhoto: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    topOfficial: {
      type: topOfficialSchema,
    },
    socialMedia: {
      type: socialMediaSchema,
    },
    offDaySchedules: {
      type: [scheduleSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SectionItemDetail", sectionItemDetailSchema);
