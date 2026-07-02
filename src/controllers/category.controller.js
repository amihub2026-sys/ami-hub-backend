const Category = require("../models/category.model");

const makeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const {
      categoryName,
      type,
      icon,
      image,
      description,
      sortOrder,
      isFeatured,
      isActive
    } = req.body;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const slug = makeSlug(categoryName);

    const exists = await Category.findOne({ slug });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      categoryName,
      slug,
      type,
      icon,
      image,
      description,
      sortOrder,
      isFeatured,
      isActive,
      createdBy: req.user?._id || null
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ sortOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.categoryName) {
      updateData.slug = makeSlug(updateData.categoryName);
    }

    updateData.updatedBy = req.user?._id || null;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};