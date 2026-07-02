const Review = require("../models/Review");
const Post = require("../models/post.model");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const updatePostRating = async (postId) => {
  const result = await Review.aggregate([
    { $match: { postId: new mongoose.Types.ObjectId(postId) } },
    {
      $group: {
        _id: "$postId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const avg = result[0]?.averageRating || 0;
  const count = result[0]?.totalReviews || 0;

  await Post.findByIdAndUpdate(postId, {
    ratingAverage: avg.toFixed(1),
    reviewsCount: count
  });
};

const createReview = async (req, res) => {
  try {
    const { postId } = req.params;

    const review = await Review.create({
  userId: req.user._id,
  postId,
  rating: req.body.rating,
  comment: req.body.comment
});

await updatePostRating(postId);

const post = await Post.findById(postId);

if (post && post.sellerId.toString() !== req.user._id.toString()) {
  await Notification.create({
    userId: post.sellerId,
    title: "New Review",
    message: "Someone reviewed your post",
    type: "new_review",
    referenceId: review._id,
    referenceModel: "Review"
  });
}

res.status(201).json({
  success: true,
  message: "Review added successfully",
  data: review
});

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPostReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ postId: req.params.postId })
      .populate("userId", "fullName mobile")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.reviewId, userId: req.user._id },
      { rating: req.body.rating, comment: req.body.comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await updatePostRating(review.postId);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      userId: req.user._id
    });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await updatePostRating(review.postId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAverageRating = async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(req.params.postId) } },
      {
        $group: {
          _id: "$postId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: result[0] || { averageRating: 0, totalReviews: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getPostReviews,
  updateReview,
  deleteReview,
  getAverageRating
};