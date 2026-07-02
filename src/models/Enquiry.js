const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },

    message: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Contacted",
        "Closed"
      ],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Enquiry",
  enquirySchema
);