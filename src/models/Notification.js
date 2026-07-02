const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "new_message",
        "new_review",
        "new_favorite",
        "post_approved",
        "post_rejected",
        "post_featured",
        "subscription_expiry",
        "admin"
      ],
      default: "admin"
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    referenceModel: {
      type: String,
      enum: ["Post", "Chat", "Message", "Review", "Favorite", "Subscription", null],
      default: null
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);