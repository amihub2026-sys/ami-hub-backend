const User = require("../models/User");
const Business = require("../models/Business");
const Review = require("../models/Review");
const Favorite = require("../models/favorite.model");
const Enquiry = require("../models/Enquiry");
const Chat = require("../models/Chat");


const getAdminDashboard = async (req, res) => {
  try {

    const [
      totalUsers,
      totalBusinesses,
      totalReviews,
      totalFavorites,
      totalEnquiries,
      totalChats
    ] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments(),
      Review.countDocuments(),
      Favorite.countDocuments(),
      Enquiry.countDocuments(),
      Chat.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBusinesses,
        totalReviews,
        totalFavorites,
        totalEnquiries,
        totalChats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getTopBusinesses = async (req, res) => {
  try {

    const data = await Review.aggregate([
      {
        $group: {
          _id: "$businessId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "businesses",
          localField: "_id",
          foreignField: "_id",
          as: "business"
        }
      },
      {
        $unwind: "$business"
      },
      {
        $sort: {
          averageRating: -1,
          totalReviews: -1
        }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getRecentActivity = async (req, res) => {
  try {

    const [chats, enquiries, reviews] = await Promise.all([
      Chat.find().sort({ createdAt: -1 }).limit(5),
      Enquiry.find().sort({ createdAt: -1 }).limit(5),
      Review.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        chats,
        enquiries,
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

const getMonthlyUserGrowth = async (req, res) => {
  try {

    const data = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMonthlyBusinessGrowth = async (req, res) => {
  try {

    const data = await Business.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBusinessOwnerDashboard = async (req, res) => {
  try {

    const businessId = req.params.businessId;

    const [
      totalReviews,
      totalEnquiries,
      totalChats,
      totalFavorites,
      reviewsData
    ] = await Promise.all([
      Review.countDocuments({ businessId }),
      Enquiry.countDocuments({ businessId }),
      Chat.countDocuments({ businessId }),
      Favorite.countDocuments({ businessId }),
      Review.find({ businessId })
    ]);

    // calculate average rating
    let avgRating = 0;

    if (reviewsData.length > 0) {
      const total = reviewsData.reduce((sum, r) => sum + r.rating, 0);
      avgRating = total / reviewsData.length;
    }

    res.status(200).json({
      success: true,
      data: {
        businessId,
        totalReviews,
        totalEnquiries,
        totalChats,
        totalFavorites,
        averageRating: avgRating.toFixed(1)
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getAdminDashboard,
  getTopBusinesses,
  getRecentActivity,
  getMonthlyUserGrowth,
  getMonthlyBusinessGrowth,
  getBusinessOwnerDashboard
};