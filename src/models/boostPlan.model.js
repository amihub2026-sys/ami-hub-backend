const mongoose = require("mongoose");

const boostPlanSchema = new mongoose.Schema(
{
  boostPlanId:{
    type:String,
    unique:true,
    required:true
  },

  boostName:{
    type:String,
    required:true
  },

  price:{
    type:Number,
    default:0
  },

  durationDays:{
    type:Number,
    default:1
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


module.exports = mongoose.model(
"BoostPlan",
boostPlanSchema
);