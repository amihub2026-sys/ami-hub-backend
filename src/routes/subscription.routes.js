const express = require("express");

const router = express.Router();

const controller = require("../controllers/subscription.controller");
const auth = require("../middlewares/auth.middleware");

// User selects a plan for themselves
router.post(
  "/create",
  auth,
  controller.createSubscription
);

// Admin assigns a plan to a selected user
router.post(
  "/admin-create",
  auth,
  controller.adminCreateSubscription
);

// Admin gets all subscriptions
router.get(
  "/",
  auth,
  controller.getAllSubscriptions
);

// Logged-in user gets their latest subscription
router.get(
  "/my-subscription",
  auth,
  controller.getMySubscription
);

// Admin updates subscription details
router.put(
  "/:id",
  auth,
  controller.updateSubscription
);

// Admin changes subscription status
router.patch(
  "/:id/status",
  auth,
  controller.updateSubscriptionStatus
);

// Admin deletes subscription
router.delete(
  "/:id",
  auth,
  controller.deleteSubscription
);

module.exports = router;