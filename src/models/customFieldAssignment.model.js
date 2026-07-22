const mongoose = require("mongoose");


const customFieldAssignmentSchema = new mongoose.Schema({

    customFieldId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CustomField",
        required:true
    },


    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },


    subcategoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subcategory",
        required:true
    },


    type:{
        type:String,
        enum:[
            "product",
            "service"
        ],
        required:true
    },


    isRequired:{
        type:Boolean,
        default:false
    },


    sortOrder:{
        type:Number,
        default:0
    }


},{
    timestamps:true
});


module.exports = mongoose.model(
    "CustomFieldAssignment",
    customFieldAssignmentSchema
);