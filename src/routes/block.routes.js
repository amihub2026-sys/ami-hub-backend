const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const blockController = require("../controllers/block.controller");

router.post("/:userId", protect, blockController.blockUser);
router.delete("/:userId", protect, blockController.unblockUser);
router.get("/", protect, blockController.getBlockedUsers);

module.exports = router;