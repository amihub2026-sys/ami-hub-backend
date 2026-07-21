const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    subcategoryName: {
      type: String,
      required: true,
      trim: true
    },
   availableIn: {
  type: [String],
  default: [],
  required: true
},
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    icon: {
      type: String,
      default: ""
    },

    image: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    sortOrder: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

subcategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Subcategory", subcategorySchema);