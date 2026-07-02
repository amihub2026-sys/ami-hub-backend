const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },

    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reason: {
      type: String,
      enum: ["spam", "fake", "wrong_category", "sold", "offensive", "other"],
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

reportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);