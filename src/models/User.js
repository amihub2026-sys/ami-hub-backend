const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
fullName: {
    type: String,
    default: ""
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
username: {
    type: String,
    sparse: true,
    trim: true
},
password: {
    type: String,
    required: false
},
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    isSeller: {
        type: Boolean,
        default: false
    },
sellerSince: {
    type: Date,
    default: null
},

sellerStatus: {
    type: String,
    enum: [
        "user",
        "seller"
    ],
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
    }

},
{
    timestamps:true
}
);


module.exports = mongoose.model(
    "User",
    userSchema
);