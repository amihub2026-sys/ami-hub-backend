const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const adminController = require("../controllers/admin.controller");

router.get("/dashboard", protect, adminController.getDashboard);
router.get("/users", protect, adminController.getAllUsers);

router.put("/users/:id/status", protect, adminController.updateUserStatus);

router.get("/posts", protect, adminController.getAllPosts);
router.get("/reports", protect, adminController.getAllReports);

router.put("/posts/:id/approve", protect, adminController.approvePost);

router.put("/posts/:id/reject", protect, adminController.rejectPost);

router.delete("/posts/:id", protect, adminController.deletePost);

module.exports = router;