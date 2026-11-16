const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile.controller");
const protect = require("../middlewares/auth.middleware");

const requireAdmin = (req, res, next) => {
  if (
    req.user?.role !== "admin" ||
    req.user?.isActive === false
  ) {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }

  next();
};

router.post(
  "/",
  protect,
  profileController.createProfile
);

router.get(
  "/me",
  protect,
  profileController.getMyProfile
);

router.put(
  "/me",
  protect,
  profileController.updateMyProfile
);

router.get(
  "/admin/:userId",
  protect,
  requireAdmin,
  profileController.getProfileForAdmin
);
router.put(
  "/admin/:userId",
  protect,
  requireAdmin,
  profileController.saveProfileForAdmin
);

module.exports = router;