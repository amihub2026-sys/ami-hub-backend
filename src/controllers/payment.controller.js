const razorpay = require("../services/razorpay.service");
const crypto = require("crypto");

const Post = require("../models/post.model");



// CREATE ORDER

exports.createOrder = async(req,res)=>{

try{

const { amount } = req.body;


const order =
await razorpay.orders.create({

amount: amount * 100,

currency:"INR",

receipt:
"ami_hub_"+Date.now()

});


res.json({

success:true,

order

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

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