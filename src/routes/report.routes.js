const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const reportController = require("../controllers/report.controller");

// User reports a post
router.post("/:postId", protect, reportController.createReport);

// Admin can view all reports
router.get("/", protect, reportController.getReports);

module.exports = router;