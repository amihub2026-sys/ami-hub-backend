const mongoose=require("mongoose");


const userSubscriptionSchema=new mongoose.Schema(
{

 userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
 },


 planId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"SubscriptionPlan",
    required:true
 },


 startDate:{
    type:Date,
    default:Date.now
 },


 expiryDate:{
    type:Date,
    required:true
 },


 remainingPosts:{
    type:Number,
    default:0
 },


 remainingAds:{
    type:Number,
    default:0
 },


 status:{
    type:String,
    enum:[
        "active",
        "expired",
        "cancelled"
    ],
    default:"active"
 }


},
{
 timestamps:true
}

);


module.exports =
mongoose.model(
"UserSubscription",
userSubscriptionSchema
);