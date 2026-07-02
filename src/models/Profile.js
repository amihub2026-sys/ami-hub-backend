const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    fullName: {
      type: String,
      required: true
    },

    businessName: {
      type: String
    },

    mobile: {
      type: String,
      required: true
    },

    email: {
      type: String
    },

    city: {
      type: String
    },

    address: {
      type: String
    },

    profileImage: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Profile", profileSchema);