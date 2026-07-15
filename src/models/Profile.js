const mongoose = require("mongoose");


const profileSchema = new mongoose.Schema(

{

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    fullName: {
        type: String,
        required: true
    },


    businessName: {
        type: String,
        default: ""
    },


    mobile: {
        type: String,
        required: true
    },


    email: {
        type: String,
        default: ""
    },


    accountType: {
        type: String,
        default: ""
    },


    category: {
        type: String,
        default: ""
    },


    city: {
        type: String,
        default: ""
    },


    address: {
        type: String,
        default: ""
    },


    profileImage: {
        type: String,
        default: null
    },


    kycImage: {
        type: String,
        default: null
    },


    qrCodeImage: {
        type: String,
        default: null
    },


    rating: {
        type: Number,
        default: 4
    },


    verified: {
        type: Boolean,
        default: false
    },


    termsAccepted: {
        type: Boolean,
        default: false
    }

},

{
    timestamps:true
}

);


module.exports = mongoose.model(
    "Profile",
    profileSchema
);