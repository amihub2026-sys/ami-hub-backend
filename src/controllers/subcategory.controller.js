const Subcategory = require("../models/subcategory.model");

const makeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

const createSubcategory = async (req, res) => {
  try {
 const {
  categoryId,
  subcategoryName,
  availableIn,
  icon,
  image,
  description,
  sortOrder,
  isActive
} = req.body;

    if (!categoryId || !subcategoryName) {
      return res.status(400).json({
        success: false,
        message: "Category and subcategory name are required"
      });
    }
    if (!Array.isArray(availableIn) || availableIn.length === 0) {
  return res.status(400).json({
    success:false,
    message:"Available In required"
  });
}

    const slug = makeSlug(subcategoryName);

const subcategory = await Subcategory.create({
  categoryId,
  subcategoryName,
  slug,

  availableIn,

  icon,
  image,
  description,
  sortOrder,
  isActive
});
    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subcategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getSubcategories = async (req, res) => {
  try {
const filter = {};

if (req.query.categoryId) {
  filter.categoryId = req.query.categoryId;
}


if (req.query.type) {
  filter.availableIn = {
    $in: [req.query.type]
  };
}

const subcategories = await Subcategory.find(filter)
      .populate(
  "categoryId",
  "categoryName slug availableIn"
)
      .sort({ sortOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getSubcategoriesByCategory = async (req, res) => {

  try {

    const subcategories = await Subcategory.find({
      categoryId: req.params.categoryId,
      isActive: true
    })
    .sort({
      sortOrder: 1,
      createdAt: -1
    });


    res.status(200).json({

      success: true,

      data: subcategories

    });


  } catch(error) {

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};
const updateSubcategory = async (req, res) => {
  try {
const updateData = { ...req.body };


if (
  updateData.availableIn &&
  (!Array.isArray(updateData.availableIn) ||
   updateData.availableIn.length === 0)
) {
  return res.status(400).json({
    success:false,
    message:"Available In required"
  });
}


if (updateData.subcategoryName) {
  updateData.slug = makeSlug(updateData.subcategoryName);
}

    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subcategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {

  createSubcategory,

  getSubcategories,

  getSubcategoriesByCategory,

  updateSubcategory,

  deleteSubcategory

};