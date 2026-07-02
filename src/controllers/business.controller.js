const Business = require("../models/Business");
const Review = require("../models/Review");
const Favorite = require("../models/favorite.model");
const Enquiry = require("../models/Enquiry");
const Notification = require("../models/Notification");
// CREATE BUSINESS
const createBusiness = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    const business = await Business.create({
      userId: req.user._id,
      title: req.body.title || "",
      description: req.body.description || "",
      category: req.body.category || "",
      price: req.body.price || 0,
      location: req.body.location || "",
      images: req.files ? req.files.map(file => file.filename) : []
    });

    res.status(201).json({
      success: true,
      message: "Business Created Successfully",
      data: business
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL BUSINESSES (PUBLIC)
const getAllBusinesses = async (req, res) => {
  try {

    // pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

   const filter = {
  status: "approved",
  isActive: true
};

const businesses = await Business.find(filter)
  .populate("userId", "fullName mobile")
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

const total = await Business.countDocuments(filter);
    res.status(200).json({
      success: true,
      count: businesses.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: businesses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET MY BUSINESSES (USER)
const getMyBusinesses = async (req, res) => {
  try {

    const businesses = await Business.find({
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      data: businesses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const searchBusinesses = async (req, res) => {
  try {

    const { q, category, city } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (city) {
      filter.location = city;
    }

    const businesses = await Business.find(filter)
      .populate("userId", "fullName mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Business.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: businesses.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: businesses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBusinessDetails = async (req, res) => {
  try {

    const business = await Business.findById(req.params.id)
      .populate("userId", "fullName mobile");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    const reviews = await Review.find({
      businessId: business._id
    }).populate("userId", "fullName");

    const enquiries = await Enquiry.countDocuments({
      businessId: business._id
    });

    const favorites = await Favorite.countDocuments({
      businessId: business._id
    });

    const reviewCount = reviews.length;

    const averageRating =
      reviewCount === 0
        ? 0
        : reviews.reduce((sum, item) => sum + item.rating, 0) /
          reviewCount;

    res.status(200).json({
      success: true,
      data: {
        business,
        averageRating,
        reviewCount,
        favoriteCount: favorites,
        enquiryCount: enquiries,
        reviews
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// UPDATE BUSINESS
const updateBusiness = async (req, res) => {
  try {

    const business = await Business.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    business.title = req.body.title || business.title;
    business.description = req.body.description || business.description;
    business.category = req.body.category || business.category;
    business.price = req.body.price || business.price;
    business.location = req.body.location || business.location;

    if (req.files && req.files.length > 0) {
      business.images = req.files.map(file => file.filename);
    }

    await business.save();

    res.status(200).json({
      success: true,
      message: "Business Updated Successfully",
      data: business
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE BUSINESS STATUS
const updateBusinessStatus = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        isActive: true
      },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
      
    }
    await Notification.create({
  userId: business.userId,
  title: "Business Status Updated",
  message: `Your business "${business.title}" has been ${business.status}`,
  type: "business"
});

    res.status(200).json({
      success: true,
      message: "Business status updated",
      data: business
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE BUSINESS
const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Business Deleted Successfully"
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBusiness,
  getAllBusinesses,
  getMyBusinesses,
  searchBusinesses,
  getBusinessDetails,
  updateBusinessStatus,
  updateBusiness,
  deleteBusiness
};