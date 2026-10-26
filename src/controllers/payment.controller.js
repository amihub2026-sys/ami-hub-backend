const razorpay = require("../services/razorpay.service");
const crypto = require("crypto");

const Post = require("../models/post.model");

const BoostPlan = require("../models/boostPlan.model");
const mongoose = require("mongoose");



// CREATE ORDER

// CREATE RAZORPAY ORDER
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || typeof planId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required"
      });
    }

    // Support MongoDB _id and custom boostPlanId
    const query = mongoose.isValidObjectId(planId)
      ? {
          $or: [
            { _id: planId },
            { boostPlanId: planId }
          ]
        }
      : { boostPlanId: planId };

    const plan = await BoostPlan.findOne({
      ...query,
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Active boost plan not found"
      });
    }

    const amount = Number(plan.price);

    if (!Number.isFinite(amount) || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid boost plan price"
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: "ami_hub_" + Date.now()
    });

    console.log("Razorpay order created:", order.id);

    return res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("RAZORPAY CREATE ORDER ERROR:", {
      message: error.message,
      statusCode: error.statusCode,
      description: error.error?.description
    });

    return res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order"
    });
  }
};




// VERIFY PAYMENT

exports.verifyPayment = async(req,res)=>{


try{


const {
razorpay_order_id,
razorpay_payment_id,
razorpay_signature
}
=
req.body;



const body =
razorpay_order_id +
"|" +
razorpay_payment_id;



const expectedSignature =
crypto
.createHmac(
"sha256",
process.env.RAZORPAY_KEY_SECRET
)
.update(body.toString())
.digest("hex");



if(expectedSignature === razorpay_signature)
{

return res.json({

success:true,
message:"Payment verified"

});


}



res.status(400).json({

success:false,
message:"Invalid payment"

});


}
catch(error){

res.status(500).json({

success:false,
message:error.message

});

}


};




// SAVE POST AFTER PAYMENT

exports.savePost = async(req,res)=>{


try{


const post =
await Post.create(req.body);



res.json({

success:true,

data:post

});


}
catch(error){


console.log(error);


res.status(500).json({

success:false,

message:error.message

});


}


};