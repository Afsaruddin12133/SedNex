const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const STATUS_VALUES = ["active", "inactive"];

const learnArabicCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
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

learnArabicCategorySchema.pre("validate", function () {
  if ((this.isModified("name") || !this.slug) && this.name) {
    this.slug = slugify(this.name);
  }
});

module.exports = mongoose.model("LearnArabicCategory", learnArabicCategorySchema);
