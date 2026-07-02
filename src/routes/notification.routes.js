const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const notificationController = require("../controllers/notification.controller");

// GET ALL NOTIFICATIONS
router.get(
  "/",
  protect,
  notificationController.getMyNotifications
);

// GET UNREAD COUNT
router.get(
  "/unread/count",
  protect,
  notificationController.unreadNotificationCount
);

// MARK ALL AS READ
router.put(
  "/read/all",
  protect,
  notificationController.markAllAsRead
);

// MARK SINGLE AS READ
router.put(
  "/:id/read",
  protect,
  notificationController.markAsRead
);

// DELETE NOTIFICATION
router.delete(
  "/:id",
  protect,
  notificationController.deleteNotification
);

module.exports = router;