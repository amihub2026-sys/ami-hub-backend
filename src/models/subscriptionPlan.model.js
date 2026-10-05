const razorpay = require("../services/razorpay.service");
const crypto = require("crypto");

const Post = require("../models/post.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");



// ============================================
// CREATE RAZORPAY ORDER
// ============================================

exports.createOrder = async (req, res) => {

  try {

    const { planId } = req.body;


    // ----------------------------------------
    // 1. CHECK PLAN ID
    // ----------------------------------------

    if (!planId) {

      return res.status(400).json({

        success: false,

        message: "Plan ID is required"

      });

    }


    // ----------------------------------------
    // 2. FIND PLAN FROM DATABASE
    // planId coming from frontend is MongoDB _id
    // ----------------------------------------

    const plan = await SubscriptionPlan.findById(
      planId
    );


    if (!plan) {

      return res.status(404).json({

        success: false,

        message: "Subscription plan not found"

      });

    }


    // ----------------------------------------
    // 3. CHECK PLAN ACTIVE
    // ----------------------------------------

    if (!plan.isActive) {

      return res.status(400).json({

        success: false,

        message: "This subscription plan is not active"

      });

    }


    // ----------------------------------------
    // 4. GET PRICE FROM DATABASE
    // NEVER trust frontend amount
    // ----------------------------------------

    const amount = Number(plan.price || 0);


    if (amount <= 0) {

      return res.status(400).json({

        success: false,

        message: "Free plan does not require payment"

      });

    }


    // ----------------------------------------
    // 5. CREATE RAZORPAY ORDER
    // Razorpay uses paise
    // ₹100 = 10000 paise
    // ----------------------------------------

    const order = await razorpay.orders.create({

      amount: Math.round(amount * 100),

      currency: "INR",

      receipt: "ami_hub_" + Date.now(),

      notes: {

        subscriptionPlanId:
          String(plan._id),

        planId:
          plan.planId,

        planName:
          plan.planName

      }

    });


    // ----------------------------------------
    // 6. RESPONSE
    // ----------------------------------------

    return res.json({

      success: true,

      order,

      plan: {

        subscriptionplanid:
          plan._id,

        planId:
          plan.planId,

        planName:
          plan.planName,

        price:
          plan.price

      }

    });


  }
  catch (error) {

    console.error(
      "CREATE ORDER ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to create payment order"

    });

  }

};



// ============================================
// VERIFY RAZORPAY PAYMENT
// ============================================

exports.verifyPayment = async (req, res) => {

  try {

    const {

      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature

    } = req.body;


    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Payment verification details are missing"

      });

    }


    // ----------------------------------------
    // CREATE EXPECTED SIGNATURE
    // ----------------------------------------

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;


    const expectedSignature =

      crypto

        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )

        .update(body.toString())

        .digest("hex");


    // ----------------------------------------
    // VERIFY
    // ----------------------------------------

    if (
      expectedSignature ===
      razorpay_signature
    ) {

      return res.json({

        success: true,

        message:
          "Payment verified successfully",

        razorpay_order_id,

        razorpay_payment_id

      });

    }


    return res.status(400).json({

      success: false,

      message:
        "Invalid payment signature"

    });


  }
  catch (error) {

    console.error(
      "VERIFY PAYMENT ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Payment verification failed"

    });

  }

};



// ============================================
// SAVE POST AFTER PAYMENT
// ============================================

exports.savePost = async (req, res) => {

  try {

    const post =
      await Post.create(
        req.body
      );


    return res.status(201).json({

      success: true,

      message:
        "Post created successfully",

      data: post

    });


  }
  catch (error) {

    console.error(
      "SAVE POST ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Failed to create post"

    });

  }

};