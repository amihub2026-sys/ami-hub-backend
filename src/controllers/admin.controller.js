const User = require("../models/User");
const Post = require("../models/post.model");
const Review = require("../models/Review");
const Favorite = require("../models/favorite.model");
const Report = require("../models/report.model");
const Chat = require("../models/Chat");
const Notification = require("../models/Notification");

const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      pendingPosts,
      approvedPosts,
      rejectedPosts,
      totalReviews,
      totalFavorites,
      totalReports,
      totalChats
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: "pending" }),
      Post.countDocuments({ status: "approved" }),
      Post.countDocuments({ status: "rejected" }),
      Review.countDocuments(),
      Favorite.countDocuments(),
      Report.countDocuments(),
      Chat.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        pendingPosts,
        approvedPosts,
        rejectedPosts,
        totalReviews,
        totalFavorites,
        totalReports,
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

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("sellerId", "fullName mobile email")
      .populate("categoryId", "categoryName slug type")
      .populate("subcategoryId", "subcategoryName slug")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("postId", "title images price status")
      .populate("reporterId", "fullName mobile email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// APPROVE POST
const approvePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    await Notification.create({
      userId: post.sellerId,
      title: "Post Approved",
      message: "Your post has been approved by admin.",
      type: "admin"
    });

    res.status(200).json({
      success: true,
      message: "Post approved successfully",
      data: post
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// REJECT POST
const rejectPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    await Notification.create({
      userId: post.sellerId,
      title: "Post Rejected",
      message: "Your post has been rejected by admin.",
      type: "admin"
    });

    res.status(200).json({
      success: true,
      message: "Post rejected successfully",
      data: post
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  getAllPosts,
  getAllReports,
  approvePost,
  rejectPost,
  deletePost
};