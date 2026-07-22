const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      default: null
    },

listingType:{
  type:String,
  required:true,
  index:true
},

    title: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    price: {
      type: Number,
      default: 0
    },

    priceType: {
      type: String,
      enum: ["fixed", "negotiable", "contact", "free"],
      default: "contact"
    },

    images: {
      type: [String],
      default: []
    },

    videos: {
      type: [String],
      default: []
    },

    contact: {
      name: { type: String, default: "" },
      mobile: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      email: { type: String, default: "" }
    },

    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "India" },
      pincode: { type: String, default: "" },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    },

    businessHours: {
      type: [String],
      default: []
    },

    socialLinks: {
      website: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" }
    },

    ratingAverage: {
      type: Number,
      default: 0
    },

    reviewsCount: {
      type: Number,
      default: 0
    },

    viewsCount: {
      type: Number,
      default: 0
    },

    uniqueViewers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],

    favoritesCount: {
      type: Number,
      default: 0
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    isBoosted: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending"
    },

    expiryDate: {
      type: Date,
      default: null
    },

    customFields: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({ title: "text", description: "text" });
postSchema.index({ categoryId: 1, subcategoryId: 1 });
postSchema.index({ listingType: 1, status: 1 });
postSchema.index({ "location.city": 1 });

module.exports = mongoose.model("Post", postSchema);