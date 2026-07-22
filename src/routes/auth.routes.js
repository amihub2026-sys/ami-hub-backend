const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const protect = require("../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/admin-login", authController.adminLogin);

router.post(
 "/send-otp",
 authController.sendOtp
);


router.post(
 "/verify-otp",
 authController.verifyOtp
);


router.get(
  "/profile",
  protect,
  authController.getProfile
);

module.exports = router;