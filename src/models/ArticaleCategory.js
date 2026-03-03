const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const articaleCategorySchema = new mongoose.Schema(
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

articaleCategorySchema.pre("validate", function () {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }
});

module.exports = mongoose.model("articaleCategory", articaleCategorySchema);
