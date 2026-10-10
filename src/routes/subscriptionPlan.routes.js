const express = require("express");

const router = express.Router();

// ==========================================
// CONTROLLER
// ==========================================

const controller = require(
  "../controllers/subscriptionPlan.controller"
);

// ==========================================
// AUTHENTICATION
// ==========================================

const auth = require(
  "../middlewares/auth.middleware"
);

// ==========================================
// PUBLIC ROUTES
// ==========================================

// GET ACTIVE SUBSCRIPTION PLANS
// GET /api/subscription-plans/active

router.get(
  "/active",
  controller.getActivePlans
);

// ==========================================
// ADMIN ROUTES
// ==========================================

// GET ALL SUBSCRIPTION PLANS
// GET /api/subscription-plans

router.get(
  "/",
  auth,
  controller.getPlans
);

// CREATE SUBSCRIPTION PLAN
// POST /api/subscription-plans

router.post(
  "/",
  auth,
  controller.createPlan
);

// UPDATE SUBSCRIPTION PLAN
// PUT /api/subscription-plans/:id

router.put(
  "/:id",
  auth,
  controller.updatePlan
);

// ACTIVATE / DEACTIVATE PLAN
// PATCH /api/subscription-plans/:id/status

router.patch(
  "/:id/status",
  auth,
  controller.toggleStatus
);

// DELETE SUBSCRIPTION PLAN
// DELETE /api/subscription-plans/:id

router.delete(
  "/:id",
  auth,
  controller.deletePlan
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;