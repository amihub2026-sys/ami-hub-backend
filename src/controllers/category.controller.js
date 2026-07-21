const Category = require("../models/category.model");

// Utility to make slug
const makeSlug = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

// Create category
exports.createCategory = async (req, res) => {
  try {

    const {
      categoryName,
      availableIn,
      icon,
      image,
      sortOrder,
      isActive
    } = req.body;


    if (!categoryName) {
      return res.status(400).json({
        success:false,
        message:"Category name required"
      });
    }


    if (!Array.isArray(availableIn) || availableIn.length === 0) {
      return res.status(400).json({
        success:false,
        message:"Available In required"
      });
    }


    const category = await Category.create({

      categoryName,

      slug: makeSlug(categoryName),

      availableIn,

      icon,
      image,

      sortOrder,

      isActive,

      createdBy: req.user?._id || null,

    });


    res.status(201).json({
      success:true,
      data:category
    });


  } catch(err){

    console.error(err);

    res.status(500).json({
      success:false,
      message:err.message
    });

  }
};

// Update category
// Update category
exports.updateCategory = async (req, res) => {
  try {

    const {
      categoryName,
      availableIn,
      icon,
      image,
      sortOrder,
      isActive
    } = req.body;


    const updateData = {

      ...(categoryName && {
        categoryName,
        slug: makeSlug(categoryName)
      }),


      ...(availableIn && {
        availableIn
      }),


      ...(icon !== undefined && {
        icon
      }),


      ...(image !== undefined && {
        image
      }),


      ...(sortOrder !== undefined && {
        sortOrder
      }),


      ...(isActive !== undefined && {
        isActive
      }),


      updatedBy: req.user?._id || null

    };


    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new:true
      }
    );


    if (!category) {
      return res.status(404).json({
        success:false,
        message:"Category not found"
      });
    }


    res.json({
      success:true,
      data:category
    });


  } catch(err) {

    console.error(err);

    res.status(500).json({
      success:false,
      message:err.message
    });

  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};