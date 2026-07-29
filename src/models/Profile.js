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


    mobile: {
        type: String,
        required: true
    },


    email: {
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