const CustomField = require("../models/CustomField");


exports.createField = async(req,res)=>{

try{

const field = await CustomField.create(req.body);


res.json({
success:true,
data:field
});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};
exports.getFields = async(req,res)=>{

try{

const fields =
await CustomField.find()
.populate("assignedCategories");


res.json({
success:true,
data:fields
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};
exports.updateField = async(req,res)=>{

try{

const field =
await CustomField.findByIdAndUpdate(
req.params.id,
req.body,
{
new:true
}
);


res.json({
success:true,
data:field
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};
exports.deleteField = async(req,res)=>{

try{

await CustomField.findByIdAndDelete(
req.params.id
);


res.json({
success:true,
message:"Deleted"
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};