const Profile = require("../models/Profile");
const Business = require("../models/Business");
const Favorite = require("../models/favorite.model");
const Review = require("../models/Review");
const Enquiry = require("../models/Enquiry");

const getDashboard = async (req, res) => {
  try {

    const userId = req.user._id;

    const profile = await Profile.findOne({
      userId
    });

    const businessCount = await Business.countDocuments({
      userId
    });

    const favoriteCount = await Favorite.countDocuments({
      userId
    });

    const reviewCount = await Review.countDocuments({
      userId
    });

    const enquiryCount = await Enquiry.countDocuments({
      userId
    });

    res.status(200).json({
      success: true,
      data: {
        profile,
        businessCount,
        favoriteCount,
        reviewCount,
        enquiryCount
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const User = require("../models/User");


const updateOnboarding = async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(

      req.user._id,

      {
        usertypeid: req.body.usertypeid,
        listingtype: req.body.listingtype || null,
        isOnboardingCompleted: true
      },

      {
        new: true
      }

    );


    if (!user) {

      return res.status(404).json({
        success:false,
        message:"User not found"
      });

    }


    res.status(200).json({

      success:true,
      message:"Account setup completed",
      data:user

    });


  } catch(error) {

    res.status(500).json({

      success:false,
      message:error.message

    });

  }

};

module.exports = {
  getDashboard,
  updateOnboarding
};