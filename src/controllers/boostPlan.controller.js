const BoostPlan = require("../models/boostPlan.model");
const Post = require("../models/post.model");
const UserBoostPlan = require("../models/userBoostPlan.model");
// CREATE
exports.createBoostPlan = async (req, res) => {
  try {
    const {
      boostName,
      price,
      durationDays
    } = req.body;

    const plan = await BoostPlan.create({
      boostPlanId: "BOOST-" + Date.now(),
      boostName,
      price,
      durationDays
    });

    res.status(201).json({
      success: true,
      data: plan
    });

  } catch (err) {
    console.log("CREATE BOOST ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// GET ALL
exports.getBoostPlans = async (req, res) => {
  try {
    const plans = await BoostPlan.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: plans
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
// GET USER BOOST PURCHASES
exports.getUserBoostPlans = async (req, res) => {
  try {
const plans = await UserBoostPlan.find()
  .populate("userId", "fullName mobile email")
  .populate("postId", "title listingType")
  .populate("boostPlanId", "boostName price durationDays")
  .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: plans
    });
  } catch (err) {
    console.log("GET USER BOOST PLANS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// PURCHASE BOOST PLAN
exports.purchaseBoostPlan = async (req, res) => {
  try {
    const {
      postId,
      boost_plan_id
    } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required"
      });
    }

    if (!boost_plan_id) {
      return res.status(400).json({
        success: false,
        message: "Boost plan ID is required"
      });
    }

    const plan = await BoostPlan.findById(boost_plan_id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Boost plan not found"
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const startDate = new Date();

    const endDate = new Date(
      startDate.getTime() +
      Number(plan.durationDays || 1) *
      24 *
      60 *
      60 *
      1000
    );

    post.isBoosted = true;
    post.isFeatured = true;
    post.featuredPlanId = plan._id;
    post.featuredPlanName = plan.boostName;
    post.featuredStartDate = startDate;
    post.featuredEndDate = endDate;

    await post.save();

await UserBoostPlan.create({
  userId: post.sellerId,
  postId: post._id,
  boostPlanId: plan._id,
  amount: plan.price,
  paymentStatus: "paid",
  startDate,
  endDate,
  isActive: true
});

    return res.status(200).json({
      success: true,
      message: "Post boosted successfully",
      data: {
        post,
        plan
      }
    });

  } catch (err) {
    console.log("PURCHASE BOOST ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// UPDATE
exports.updateBoostPlan = async (req, res) => {
  try {
    const plan = await BoostPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true
      }
    );

    res.json({
      success: true,
      data: plan
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// DELETE
exports.deleteBoostPlan = async (req, res) => {
  try {
    await BoostPlan.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};