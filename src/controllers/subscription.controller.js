const mongoose = require("mongoose");

const UserSubscription = require("../models/userSubscription.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const User = require("../models/User");

const populateSubscription = (query) => {
  return query
    .populate("userId", "fullName username mobile email role isActive")
    .populate(
      "planId",
      "planName planId price validity postLimit adLimit videoEnabled isActive"
    );
};

// ======================================================
// USER SELECTS PLAN FOR THEMSELVES
// POST /api/subscriptions/create
// ======================================================
exports.createSubscription = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { planId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Subscription plan ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan ID"
      });
    }

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found"
      });
    }

    if (!plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "This subscription plan is inactive"
      });
    }

    const startDate = new Date();

    const expiryDate = new Date(startDate);
    expiryDate.setDate(
      expiryDate.getDate() + Number(plan.validity || 0)
    );

    // Expire previous active subscription
    await UserSubscription.updateMany(
      {
        userId,
        status: "active"
      },
      {
        $set: {
          status: "expired"
        }
      }
    );

    const subscription = await UserSubscription.create({
      userId,
      planId: plan._id,
      startDate,
      expiryDate,
      remainingPosts: Number(plan.postLimit || 0),
      remainingAds: Number(plan.adLimit || 0),
      status: "active"
    });

    const populatedSubscription = await populateSubscription(
      UserSubscription.findById(subscription._id)
    );

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: populatedSubscription
    });
  } catch (error) {
    console.error("CREATE SUBSCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create subscription"
    });
  }
};

// ======================================================
// ADMIN ASSIGNS PLAN TO A SELECTED USER
// POST /api/subscriptions/admin-create
// ======================================================
exports.adminCreateSubscription = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const { userId, planId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Subscription plan ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan ID"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found"
      });
    }

    if (!plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "This subscription plan is inactive"
      });
    }

    const startDate = new Date();

    const expiryDate = new Date(startDate);
    expiryDate.setDate(
      expiryDate.getDate() + Number(plan.validity || 0)
    );

    // Expire selected user's previous active subscription
    await UserSubscription.updateMany(
      {
        userId,
        status: "active"
      },
      {
        $set: {
          status: "expired"
        }
      }
    );

    const subscription = await UserSubscription.create({
      userId,
      planId: plan._id,
      startDate,
      expiryDate,
      remainingPosts: Number(plan.postLimit || 0),
      remainingAds: Number(plan.adLimit || 0),
      status: "active"
    });

    const populatedSubscription = await populateSubscription(
      UserSubscription.findById(subscription._id)
    );

    return res.status(201).json({
      success: true,
      message: "Subscription assigned successfully",
      data: populatedSubscription
    });
  } catch (error) {
    console.error("ADMIN CREATE SUBSCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to assign subscription"
    });
  }
};

// ======================================================
// GET ALL USER SUBSCRIPTIONS
// GET /api/subscriptions
// ======================================================
exports.getAllSubscriptions = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const subscriptions = await populateSubscription(
      UserSubscription.find().sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    console.error("GET SUBSCRIPTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load subscriptions"
    });
  }
};

// ======================================================
// GET LOGGED-IN USER SUBSCRIPTION
// GET /api/subscriptions/my-subscription
// ======================================================
exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await populateSubscription(
      UserSubscription.findOne({
        userId: req.user._id
      }).sort({ createdAt: -1 })
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found"
      });
    }

    if (
      subscription.status === "active" &&
      new Date(subscription.expiryDate) < new Date()
    ) {
      subscription.status = "expired";
      await subscription.save();
    }

    return res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error("GET MY SUBSCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load subscription"
    });
  }
};

// ======================================================
// ADMIN UPDATE SUBSCRIPTION
// PUT /api/subscriptions/:id
// ======================================================
exports.updateSubscription = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription = await UserSubscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const {
      startDate,
      expiryDate,
      remainingPosts,
      remainingAds,
      status
    } = req.body;

    if (startDate !== undefined) {
      const parsedStartDate = new Date(startDate);

      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date"
        });
      }

      subscription.startDate = parsedStartDate;
    }

    if (expiryDate !== undefined) {
      const parsedExpiryDate = new Date(expiryDate);

      if (isNaN(parsedExpiryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date"
        });
      }

      subscription.expiryDate = parsedExpiryDate;
    }

    if (remainingPosts !== undefined) {
      subscription.remainingPosts = Number(remainingPosts);
    }

    if (remainingAds !== undefined) {
      subscription.remainingAds = Number(remainingAds);
    }

    if (status !== undefined) {
      const allowedStatuses = ["active", "expired", "cancelled"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription status"
        });
      }

      subscription.status = status;
    }

    await subscription.save();

    const populatedSubscription = await populateSubscription(
      UserSubscription.findById(subscription._id)
    );

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: populatedSubscription
    });
  } catch (error) {
    console.error("UPDATE SUBSCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update subscription"
    });
  }
};

// ======================================================
// ADMIN CHANGE STATUS
// PATCH /api/subscriptions/:id/status
// ======================================================
exports.updateSubscriptionStatus = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const allowedStatuses = ["active", "expired", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active, expired, or cancelled"
      });
    }

    const subscription = await UserSubscription.findByIdAndUpdate(
      id,
      {
        $set: {
          status
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const populatedSubscription = await populateSubscription(
      UserSubscription.findById(subscription._id)
    );

    return res.status(200).json({
      success: true,
      message: "Subscription status updated successfully",
      data: populatedSubscription
    });
  } catch (error) {
    console.error("UPDATE SUBSCRIPTION STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update subscription status"
    });
  }
};

// ======================================================
// ADMIN DELETE SUBSCRIPTION
// DELETE /api/subscriptions/:id
// ======================================================
exports.deleteSubscription = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription = await UserSubscription.findByIdAndDelete(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription deleted successfully"
    });
  } catch (error) {
    console.error("DELETE SUBSCRIPTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete subscription"
    });
  }
};