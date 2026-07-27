const mongoose = require("mongoose");

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      unique: true
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true
    },

    amountPaid: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    razorpayOrderId: {
      type: String,
      required: true
    },

    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true
    },

    razorpaySignature: {
      type: String,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded"
      ],
      default: "pending"
    },

    startDate: {
      type: Date,
      default: Date.now
    },

    expiryDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: [
        "active",
        "expired",
        "cancelled"
      ],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "UserSubscription",
  userSubscriptionSchema
);