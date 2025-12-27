const mongoose = require("mongoose");
const slugify = require("../utils/slugify");

const specificationEntrySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const colorVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    stock: { type: Number, min: 0 },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    images: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      trim: true,
    },
    specifications: {
      type: [specificationEntrySchema],
      default: [],
    },
    colorVariants: {
      type: [colorVariantSchema],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    loveCount: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
          enum: ["new", "sale", "featured", "limited", "popular"],
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("validate", function () {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name);
  }

  if (this.discountPrice !== undefined && this.discountPrice !== null) {
    if (this.discountPrice > this.price) {
      this.invalidate("discountPrice", "Discount price cannot exceed price");
    }
  }
});

module.exports = mongoose.model("Product", productSchema);
