const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const reviewController = require("../controllers/review.controller");

// Add review to post
router.post("/:postId", protect, reviewController.createReview);

// Get post reviews
router.get("/:postId", reviewController.getPostReviews);

// Get post average rating
router.get("/:postId/average", reviewController.getAverageRating);

// Update review
router.put("/:reviewId", protect, reviewController.updateReview);

// Delete review
router.delete("/:reviewId", protect, reviewController.deleteReview);

module.exports = router;