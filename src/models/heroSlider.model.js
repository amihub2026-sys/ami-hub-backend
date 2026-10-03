const mongoose = require("mongoose");

const heroSliderSchema = new mongoose.Schema(
  {

    desktopImage: {
      type: String,
      required: true,
    },

    desktopKey: {
      type: String,
      required: true,
    },

    mobileImage: {
      type: String,
      required: true,
    },

    mobileKey: {
      type: String,
      required: true,
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