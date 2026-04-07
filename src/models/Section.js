const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const STATUS_VALUES = ["active", "inactive"];

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: "active",
    },
  },
  { timestamps: true }
);

sectionSchema.pre("validate", function () {
  if ((this.isModified("name") || !this.slug) && this.name) {
    this.slug = slugify(this.name);
  }
});

module.exports = mongoose.model("Section", sectionSchema);
