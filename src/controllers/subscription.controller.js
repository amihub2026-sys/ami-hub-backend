
const mongoose = require("mongoose");

const UserSubscription = require("../models/userSubscription.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const User = require("../models/User");

// ======================================================
// HELPERS
// ======================================================

const populateSubscription = (query) => {
  return query
    .populate(
      "userId",
      "fullName username mobile email role isActive"
    )
    .populate(
      "planId",
      "planName planId price duration validity postLimit adLimit videoEnabled isActive"
    );
};

const getValidityDays = (plan) => {
  const days = Number(
    plan.duration ?? plan.validity ?? 30
  );

  if (!Number.isInteger(days) || days < 1) {
    throw new Error("Invalid subscription validity");
  }

  return days;
};

const getExpiryDate = (startDate, days) => {
  const expiryDate = new Date(startDate);

  expiryDate.setUTCDate(
    expiryDate.getUTCDate() + days
  );

  return expiryDate;
};

const isSubscriptionValid = (subscription) => {
  return (
    subscription &&
    subscription.status === "active" &&
    new Date(subscription.expiryDate).getTime() > Date.now()
  );
};

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const sendError = (res, error, fallback) => {
  console.error(fallback, error);

  return res.status(500).json({
    success: false,
    message: error.message || fallback
  });
};

// ======================================================
// 1. USER SELECTS A FREE SUBSCRIPTION PLAN
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

    if (!planId || !isValidObjectId(planId)) {
      return res.status(400).json({
        success: false,
        message: "Valid subscription plan ID is required"
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

    // Paid subscriptions must be activated by a separate
    // server-side verified Razorpay payment process.
    if (Number(plan.price) > 0) {
      return res.status(403).json({
        success: false,
        requiresPayment: true,
        message:
          "Paid plans require verified Razorpay payment."
      });
    }

    const existingValidSubscription =
      await UserSubscription.findOne({
        userId,
        status: "active",
        expiryDate: { $gt: new Date() }
      }).sort({ createdAt: -1 });

    // Reuse an existing valid subscription.
    // Do not reset the user's remaining post allowance.
    if (existingValidSubscription) {
      const populated = await populateSubscription(
        UserSubscription.findById(existingValidSubscription._id)
      );

      return res.status(200).json({
        success: true,
        alreadyActive: true,
        message: "An active subscription already exists",
        data: populated
      });
    }

    // Protect against repeated free-plan activation,
    // which could give users unlimited free posts.
    const previousSubscription =
      await UserSubscription.findOne({
        userId
      }).sort({ createdAt: -1 });

    if (previousSubscription) {
      return res.status(409).json({
        success: false,
        requiresRenewal: true,
        message:
          "Your previous subscription is expired or inactive. Please renew through an administrator."
      });
    }

    const validityDays = getValidityDays(plan);

    const startDate = new Date();
    const expiryDate = getExpiryDate(
      startDate,
      validityDays
    );

    const subscription =
      await UserSubscription.create({
        userId,
        planId: plan._id,
        amountPaid: 0,
        currency: "INR",
        paymentStatus: "paid",
        startDate,
        expiryDate,
        remainingPosts: Number(plan.postLimit || 0),
        remainingAds: Number(plan.adLimit || 0),
        status: "active"
      });

    const populated = await populateSubscription(
      UserSubscription.findById(subscription._id)
    );

    return res.status(201).json({
      success: true,
      message: "Free subscription activated successfully",
      data: populated
    });

  } catch (error) {
    return sendError(
      res,
      error,
      "CREATE SUBSCRIPTION ERROR"
    );
  }
};

// ======================================================
// 2. ADMIN ASSIGNS A SUBSCRIPTION TO A USER
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

    if (
      !userId ||
      !planId ||
      !isValidObjectId(userId) ||
      !isValidObjectId(planId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID and plan ID are required"
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

    const validityDays = getValidityDays(plan);

    const startDate = new Date();
    const expiryDate = getExpiryDate(
      startDate,
      validityDays
    );

    // Admin-authorized plan assignment.
    // Existing subscription records remain in MongoDB,
    // but their previous active status is closed.
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

    const subscription =
      await UserSubscription.create({
        userId,
        planId: plan._id,
        amountPaid: 0,
        currency: "INR",
        paymentStatus: Number(plan.price) > 0
          ? "pending"
          : "paid",
        startDate,
        expiryDate,
        remainingPosts: Number(plan.postLimit || 0),
        remainingAds: Number(plan.adLimit || 0),
        status: "active"
      });

    const populated = await populateSubscription(
      UserSubscription.findById(subscription._id)
    );

    return res.status(201).json({
      success: true,
      message: "Subscription assigned successfully",
      data: populated
    });

  } catch (error) {
    return sendError(
      res,
      error,
      "ADMIN CREATE SUBSCRIPTION ERROR"
    );
  }
};

// ======================================================
// 3. GET ALL USER SUBSCRIPTIONS (ADMIN)
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
      UserSubscription.find()
        .sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });

  } catch (error) {
    return sendError(
      res,
      error,
      "GET SUBSCRIPTIONS ERROR"
    );
  }
};

// ======================================================
// 4. GET LOGGED-IN USER'S SUBSCRIPTION
// GET /api/subscriptions/my-subscription
// ======================================================

exports.getMySubscription = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    // Prefer the latest genuinely active subscription.
    let subscription = await UserSubscription.findOne({
      userId: req.user._id,
      status: "active",
      expiryDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!subscription) {
      subscription = await UserSubscription.findOne({
        userId: req.user._id
      }).sort({ createdAt: -1 });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found"
      });
    }

    if (
      subscription.status === "active" &&
      new Date(subscription.expiryDate) <= new Date()
    ) {
      subscription.status = "expired";
      await subscription.save();
    }

    const populated = await populateSubscription(
      UserSubscription.findById(subscription._id)
    );

    return res.status(200).json({
      success: true,
      data: populated
    });

  } catch (error) {
    return sendError(
      res,
      error,
      "GET MY SUBSCRIPTION ERROR"
    );
  }
};

// ======================================================
// 5. ADMIN UPDATES SUBSCRIPTION DETAILS
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription =
      await UserSubscription.findById(id);

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
      const date = new Date(startDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date"
        });
      }

      subscription.startDate = date;
    }

    if (expiryDate !== undefined) {
      const date = new Date(expiryDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date"
        });
      }

      subscription.expiryDate = date;
    }

    if (remainingPosts !== undefined) {
      const posts = Number(remainingPosts);

      if (!Number.isInteger(posts) || posts < 0) {
        return res.status(400).json({
          success: false,
          message: "Remaining posts must be zero or greater"
        });
      }

      subscription.remainingPosts = posts;
    }

    if (remainingAds !== undefined) {
      const ads = Number(remainingAds);

      if (!Number.isInteger(ads) || ads < 0) {
        return res.status(400).json({
          success: false,
          message: "Remaining ads must be zero or greater"
        });
      }

      subscription.remainingAds = ads;
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "active",
        "expired",
        "cancelled"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid subscription status"
        });
      }

      subscription.status = status;
    }

    await subscription.save();

    const populated = await populateSubscription(
      UserSubscription.findById(subscription._id)
    );

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: populated
    });

  } catch (error) {
    return sendError(
      res,
      error,
      "UPDATE SUBSCRIPTION ERROR"
    );
  }
};

// ======================================================
// 6. ADMIN CHANGES SUBSCRIPTION STATUS
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const allowedStatuses = [
      "active",
      "expired",
      "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be active, expired, or cancelled"
      });
    }

    const subscription =
      await UserSubscription.findByIdAndUpdate(
        id,
        { $set: { status } },
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

    const populated = await populateSubscription(
      UserSubscription.findById(subscription._id)
    );

    return res.status(200).json({
      success: true,
      message: "Subscription status updated successfully",
      data: populated
    });

  } catch (error) {
    return sendError(
      res,
      error,
      "UPDATE SUBSCRIPTION STATUS ERROR"
    );
  }
};

// ======================================================
// 7. ADMIN DELETES SUBSCRIPTION
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

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID"
      });
    }

    const subscription =
      await UserSubscription.findByIdAndDelete(id);

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
    return sendError(
      res,
      error,
      "DELETE SUBSCRIPTION ERROR"
    );
  }
};
