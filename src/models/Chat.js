const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    lastMessage: {
      type: String,
      default: ""
    },

    lastMessageAt: {
      type: Date,
      default: Date.now
    },

    unreadBuyer: {
      type: Number,
      default: 0
    },

    unreadSeller: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

chatSchema.index(
  { postId: 1, buyerId: 1, sellerId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Chat", chatSchema);