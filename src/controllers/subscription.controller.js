
const UserSubscription =
require("../models/userSubscription.model");

exports.createSubscription = async(req,res)=>{



try{

console.log("USER DATA:", req.user);
console.log("BODY DATA:", req.body);


const subscription =
await UserSubscription.create({

    userId:req.user._id,

    planId:req.body.planId,

    expiryDate:req.body.expiryDate,

    remainingPosts:
    req.body.remainingPosts || 0,

    remainingAds:
    req.body.remainingAds || 0

});


res.status(201).json({

    success:true,

    message:"Subscription created successfully",

    data:subscription

});


}
catch(error){

console.log("SUBSCRIPTION ERROR:", error);

res.status(500).json({

    success:false,

    message:error.message

});

}

};