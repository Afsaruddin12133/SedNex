const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    about: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
