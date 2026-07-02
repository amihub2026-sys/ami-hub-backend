const Block = require("../models/block.model");
const User = require("../models/User");

const blockUser = async (req, res) => {
  try {
    const blockedUserId = req.params.userId;

    if (blockedUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself"
      });
    }

    const user = await User.findById(blockedUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const block = await Block.create({
      blockerId: req.user._id,
      blockedUserId
    });

    res.status(201).json({
      success: true,
      message: "User blocked successfully",
      data: block
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const unblockUser = async (req, res) => {
  try {
    const block = await Block.findOneAndDelete({
      blockerId: req.user._id,
      blockedUserId: req.params.userId
    });

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Blocked user not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User unblocked successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBlockedUsers = async (req, res) => {
  try {
    const blockedUsers = await Block.find({
      blockerId: req.user._id
    }).populate("blockedUserId", "fullName mobile email");

    res.status(200).json({
      success: true,
      count: blockedUsers.length,
      data: blockedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  blockUser,
  unblockUser,
  getBlockedUsers
};