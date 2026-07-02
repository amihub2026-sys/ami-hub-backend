const express = require("express");
const router = express.Router();

const subcategoryController = require("../controllers/subcategory.controller");
const protect = require("../middlewares/auth.middleware");

// Create
router.post("/", protect, subcategoryController.createSubcategory);

// Read
router.get("/", subcategoryController.getSubcategories);

// Update
router.put("/:id", protect, subcategoryController.updateSubcategory);

// Delete
router.delete("/:id", protect, subcategoryController.deleteSubcategory);

module.exports = router;