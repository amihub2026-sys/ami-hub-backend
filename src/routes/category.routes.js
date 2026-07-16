const express=require("express");

const router=express.Router();

const controller=require("../controllers/category.controller");


const protect=require("../middlewares/auth.middleware");



router.get(
"/",
controller.getCategories
);


router.post(
"/",
protect,
controller.createCategory
);



router.put(
"/:id",
protect,
controller.updateCategory
);



router.delete(
"/:id",
protect,
controller.deleteCategory
);



module.exports=router;