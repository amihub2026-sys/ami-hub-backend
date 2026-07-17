const BoostPlan = require("../models/boostPlan.model");


// CREATE
exports.createBoostPlan = async(req,res)=>{

try{

const {
boostName,
price,
durationDays
}=req.body;


const plan = await BoostPlan.create({

boostPlanId: "BOOST-" + Date.now(),

boostName,
price,
durationDays

});


res.status(201).json({
success:true,
data:plan
});


}catch(err){

console.log("CREATE BOOST ERROR:",err);

res.status(500).json({
success:false,
message:err.message
});

}

};

// GET ALL

exports.getBoostPlans = async(req,res)=>{

try{

const plans =
await BoostPlan.find()
.sort({createdAt:-1});


res.json({
success:true,
data:plans
});


}catch(err){

res.status(500).json({
success:false,
message:err.message
});

}

};




// UPDATE

exports.updateBoostPlan = async(req,res)=>{

try{

const plan =
await BoostPlan.findByIdAndUpdate(
req.params.id,
req.body,
{
new:true
}
);


res.json({
success:true,
data:plan
});


}catch(err){

res.status(500).json({
success:false,
message:err.message
});

}

};




// DELETE

exports.deleteBoostPlan = async(req,res)=>{

try{

await BoostPlan.findByIdAndDelete(
req.params.id
);


res.json({
success:true
});


}catch(err){

res.status(500).json({
success:false,
message:err.message
});

}

};