const mongoose = require("mongoose");

const customFieldSchema = new mongoose.Schema({

    fieldName:{
        type:String,
        required:true
    },

    label:{
        type:String,
        required:true
    },

    icon:{
        type:String,
        default:""
    },

    fieldType:{
        type:String,
        required:true
    },

    options:[
        String
    ],

    isRequired:{
        type:Boolean,
        default:false
    },

    assignedCategories:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Category"
        }
    ],

    assignedSubCategories:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubCategory"
        }
    ],

    isActive:{
        type:Boolean,
        default:true
    }

},{
    timestamps:true
});


module.exports = mongoose.model(
    "CustomField",
    customFieldSchema
);