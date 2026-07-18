const express=require("express");

const router=express.Router();


const controller =
require("../controllers/customField.controller");


router.post(
"/",
controller.createField
);


router.get(
"/",
controller.getFields
);


router.put(
"/:id",
controller.updateField
);


router.delete(
"/:id",
controller.deleteField
);


module.exports=router;