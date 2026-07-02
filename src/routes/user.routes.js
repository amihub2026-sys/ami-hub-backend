const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

router.get("/dashboard", protect, userController.getDashboard);

module.exports = router;