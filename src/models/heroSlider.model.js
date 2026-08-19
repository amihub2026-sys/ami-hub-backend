const mongoose = require("mongoose");

const heroSliderSchema = new mongoose.Schema(
  {
    desktopImageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    mobileImageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "HeroSlider",
  heroSliderSchema
);