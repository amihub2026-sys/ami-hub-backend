const mongoose = require("mongoose");


const subscriptionPlanSchema = new mongoose.Schema(
{

    planName:{
        type:String,
        required:true,
        trim:true
    },


    planId:{
        type:String,
        required:true,
        unique:true
    },


    price:{
        type:Number,
        default:0
    },


    validity:{
        type:Number,
        default:30
    },


    postLimit:{
        type:Number,
        default:0
    },


    adLimit:{
        type:Number,
        default:0
    },


    videoEnabled:{
        type:Boolean,
        default:false
    },


    remaining:{
        type:Number,
        default:0
    },


    isActive:{
        type:Boolean,
        default:true
    }


},
{
    timestamps:true
}

);


module.exports =
mongoose.model(
"SubscriptionPlan",
subscriptionPlanSchema
);