const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

// Create or get chat
router.post("/", protect, chatController.createChat);

// Get my chats
router.get("/", protect, chatController.getMyChats);

// Unread count
router.get("/unread/count", protect, chatController.getUnreadCount);

// Get messages
router.get("/:chatId/messages", protect, chatController.getMessages);

// Send message
router.post("/:chatId/messages", protect, chatController.sendMessage);

// Mark messages as read
router.put("/:chatId/read", protect, chatController.markAsRead);

module.exports = router;