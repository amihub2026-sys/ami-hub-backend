const CustomFieldAssignment = require("../models/customFieldAssignment.model");


// CREATE ASSIGNMENT
exports.assignFields = async (req,res)=>{

try{

const {
    customFieldIds,
    categoryId,
    subcategoryId,
    type
}=req.body;



if(
    !customFieldIds ||
    !Array.isArray(customFieldIds) ||
    customFieldIds.length === 0
){

return res.status(400).json({
    success:false,
    message:"Select custom fields"
});

}



const assignments = customFieldIds.map(
(fieldId)=>({

    customFieldId:fieldId,

    categoryId,

    subcategoryId,

    type

})
);



await CustomFieldAssignment.insertMany(assignments);



res.json({

success:true,

message:"Custom fields assigned successfully"

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};



// GET ASSIGNED FIELDS
exports.getAssignedFields = async(req,res)=>{


try{


const {
categoryId,
subcategoryId,
type
}=req.query;



const fields =
await CustomFieldAssignment.find({

categoryId,

subcategoryId,

type

})
.populate(
"customFieldId"
);



res.json({

success:true,

data:fields

});


}catch(error){


res.status(500).json({

success:false,

message:error.message

});


}

};



// REMOVE ASSIGNMENT
exports.removeAssignment = async(req,res)=>{


try{


await CustomFieldAssignment.findByIdAndDelete(
req.params.id
);



res.json({

success:true,

message:"Assignment removed"

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
// GET ALL ASSIGNMENTS FOR ADMIN

exports.getAllAssignments = async(req,res)=>{

try{

const assignments =
await CustomFieldAssignment.find()

.populate("customFieldId")
.populate("categoryId")
.populate("subcategoryId")
.sort({
    createdAt:-1
});


res.json({

success:true,

data:assignments

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
// UPDATE ASSIGNMENT

exports.updateAssignment = async(req,res)=>{

try{

const updated =
await CustomFieldAssignment.findByIdAndUpdate(

req.params.id,

req.body,

{
 new:true
}

);


if(!updated){

return res.status(404).json({

success:false,

message:"Assignment not found"

});

}


res.json({

success:true,

data:updated

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};