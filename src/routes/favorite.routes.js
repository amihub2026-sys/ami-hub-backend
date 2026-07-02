const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const favoriteController = require("../controllers/favorite.controller");

// Add / Remove favorite
router.post("/:postId", protect, favoriteController.toggleFavorite);

// My favorites
router.get("/", protect, favoriteController.getMyFavorites);

// Check favorite status
router.get("/:postId/status", protect, favoriteController.checkFavoriteStatus);

// Favorite count
router.get("/:postId/count", favoriteController.getFavoriteCount);

module.exports = router;