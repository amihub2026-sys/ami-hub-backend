const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: true
    },

    mobile: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

   email: {
  type: String,
  sparse: true,
  trim: true,
  lowercase: true
},

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("User", userSchema);