const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    category: {
      type: String
    },

    price: {
      type: Number
    },

    location: {
      type: String
    },

    images: {
      type: [String]
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Business", businessSchema);