const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

router.get("/admin", protect, dashboardController.getAdminDashboard);

router.get("/top-businesses", protect, dashboardController.getTopBusinesses);

router.get("/recent-activity", protect, dashboardController.getRecentActivity);

router.get("/growth/users", protect, dashboardController.getMonthlyUserGrowth);

router.get("/growth/businesses", protect, dashboardController.getMonthlyBusinessGrowth);

router.get("/top/businesses", protect, dashboardController.getTopBusinesses);

router.get(
  "/business/:businessId",
  protect,
  dashboardController.getBusinessOwnerDashboard
);

module.exports = router;