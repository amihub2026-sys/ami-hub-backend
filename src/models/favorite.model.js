const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    }
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);