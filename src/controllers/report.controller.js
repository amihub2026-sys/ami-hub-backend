const Report = require("../models/report.model");
const Post = require("../models/post.model");

const createReport = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason, description } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (post.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report your own post"
      });
    }

    const report = await Report.create({
      postId,
      reporterId: req.user._id,
      reason,
      description
    });

    res.status(201).json({
      success: true,
      message: "Post reported successfully",
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getReports = async (req, res) => {
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

module.exports = {
  createReport,
  getReports
};