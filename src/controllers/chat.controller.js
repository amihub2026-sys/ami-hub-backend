const Chat = require("../models/Chat");
const Message = require("../models/message.model");
const Post = require("../models/post.model");
const Notification = require("../models/Notification");
const Block = require("../models/block.model");

// CREATE OR GET CHAT
const createChat = async (req, res) => {
  try {
    const { postId } = req.body;
    const buyerId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const sellerId = post.sellerId;

    const blocked = await Block.findOne({
  $or: [
    { blockerId: buyerId, blockedUserId: sellerId },
    { blockerId: sellerId, blockedUserId: buyerId }
  ]
});

if (blocked) {
  return res.status(403).json({
    success: false,
    message: "You cannot chat with this user"
  });
}

    if (buyerId.toString() === sellerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself"
      });
    }

    let chat = await Chat.findOne({ postId, buyerId, sellerId });

    if (!chat) {
      chat = await Chat.create({ postId, buyerId, sellerId });
    }

    res.status(200).json({
      success: true,
      message: "Chat ready",
      data: chat
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET MY CHATS
const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        { buyerId: req.user._id },
        { sellerId: req.user._id }
      ]
    })
      .populate("buyerId", "fullName mobile")
      .populate("sellerId", "fullName mobile")
      .populate("postId", "title images price")
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    const senderId = req.user._id;
    const receiverId =
      chat.buyerId.toString() === senderId.toString()
        ? chat.sellerId
        : chat.buyerId;

        const blocked = await Block.findOne({
  $or: [
    { blockerId: senderId, blockedUserId: receiverId },
    { blockerId: receiverId, blockedUserId: senderId }
  ]
});

if (blocked) {
  return res.status(403).json({
    success: false,
    message: "You cannot send messages to this user"
  });
}

    const newMessage = await Message.create({
      chatId,
      senderId,
      receiverId,
      message,
      messageType: "text"
    });

    chat.lastMessage = message;
    chat.lastMessageAt = new Date();

    if (receiverId.toString() === chat.buyerId.toString()) {
      chat.unreadBuyer += 1;
    } else {
      chat.unreadSeller += 1;
    }

   await chat.save();

await Notification.create({
  userId: receiverId,
  title: "New Message",
  message: message || "You received a new message",
  type: "new_message",
  referenceId: chat._id,
  referenceModel: "Chat"
});

res.status(201).json({
  success: true,
  message: "Message sent",
  data: newMessage
});

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET MESSAGES
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId
    })
      .populate("senderId", "fullName mobile")
      .populate("receiverId", "fullName mobile")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MARK READ
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    await Message.updateMany(
      {
        chatId,
        receiverId: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    if (chat.buyerId.toString() === req.user._id.toString()) {
      chat.unreadBuyer = 0;
    }

    if (chat.sellerId.toString() === req.user._id.toString()) {
      chat.unreadSeller = 0;
    }

    await chat.save();

    res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UNREAD COUNT
const getUnreadCount = async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        { buyerId: req.user._id },
        { sellerId: req.user._id }
      ]
    });

    let unreadCount = 0;

    chats.forEach((chat) => {
      if (chat.buyerId.toString() === req.user._id.toString()) {
        unreadCount += chat.unreadBuyer;
      }

      if (chat.sellerId.toString() === req.user._id.toString()) {
        unreadCount += chat.unreadSeller;
      }
    });

    res.status(200).json({
      success: true,
      unreadCount
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createChat,
  getMyChats,
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount
};