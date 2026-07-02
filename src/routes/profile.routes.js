const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile.controller");
const protect = require("../middlewares/auth.middleware");

router.post("/", protect, profileController.createProfile);
router.get(
  "/me",
  protect,
  profileController.getMyProfile
);
router.put("/me", protect, profileController.updateMyProfile);
module.exports = router;