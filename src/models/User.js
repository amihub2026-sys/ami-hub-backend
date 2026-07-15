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

    email: {
        type: String,
        sparse: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },


    username: {
        type: String,
        unique: true,
        sparse: true
    },


    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },


    isActive: {
        type: Boolean,
        default: true
    },


    isOnboardingCompleted: {
        type: Boolean,
        default: false
    },


    usertypeid: {
        type: Number,
        default: 1
    },


    listingtype: {
        type: String,
        enum: ["product", "service", null],
        default: null
    }

},
{
    timestamps: true
}
);


module.exports = mongoose.model(
    "User",
    userSchema
);