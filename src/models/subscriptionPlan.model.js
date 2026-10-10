const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    planName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    duration: {
      type: Number,
      default: 30,
      min: 1
    },

    postLimit: {
      type: Number,
      default: 0
    },

    adLimit: {
      type: Number,
      default: 0
    },

    remainingAds: {
      type: Number,
      default: 0
    },

    videoEnabled: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    features: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    collection: "subscriptionplans"
  }
);

module.exports =
  mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", subscriptionPlanSchema);