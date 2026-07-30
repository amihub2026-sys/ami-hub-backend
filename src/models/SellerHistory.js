const mongoose = require("mongoose");


const sellerHistorySchema = new mongoose.Schema(
{
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    action:{
        type:String,
        enum:[
            "became_seller",
            "removed_seller"
        ],
        required:true
    }

},
{
    timestamps:true
}
);


module.exports = mongoose.model(
    "SellerHistory",
    sellerHistorySchema
);