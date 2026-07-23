const express = require("express");

const router = express.Router();

const subcategoryController = require("../controllers/subcategory.controller");

const protect = require("../middlewares/auth.middleware");


// CREATE
router.post(
  "/",
  protect,
  subcategoryController.createSubcategory
);


// GET ALL
router.get(
  "/",
  subcategoryController.getSubcategories
);


// GET BY CATEGORY
router.get(
  "/category/:categoryId",
  subcategoryController.getSubcategoriesByCategory
);


// UPDATE
router.put(
  "/:id",
  protect,
  subcategoryController.updateSubcategory
);


// DELETE
router.delete(
  "/:id",
  protect,
  subcategoryController.deleteSubcategory
);


module.exports = router;