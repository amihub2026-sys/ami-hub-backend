const Favorite = require("../models/favorite.model");
const Notification = require("../models/Notification");
const Post = require("../models/post.model");

// ADD / REMOVE FAVORITE
const toggleFavorite = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const existing = await Favorite.findOne({
      userId: req.user._id,
      postId
    });

    if (existing) {
      await existing.deleteOne();

      await Post.findByIdAndUpdate(postId, {
        $inc: { favoritesCount: -1 }
      });

      return res.status(200).json({
        success: true,
        message: "Removed from favorites",
        isFavorite: false
      });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      postId
    });

    await Post.findByIdAndUpdate(postId, {
  $inc: { favoritesCount: 1 }
});

if (post.sellerId.toString() !== req.user._id.toString()) {
  await Notification.create({
    userId: post.sellerId,
    title: "New Favorite",
    message: "Someone added your post to favorites",
    type: "new_favorite",
    referenceId: post._id,
    referenceModel: "Post"
  });
}

res.status(201).json({
      success: true,
      message: "Added to favorites",
      isFavorite: true,
      data: favorite
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET MY FAVORITES
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      userId: req.user._id
    }).populate({
      path: "postId",
      populate: [
        { path: "categoryId", select: "categoryName slug type" },
        { path: "subcategoryId", select: "subcategoryName slug" },
        { path: "sellerId", select: "fullName mobile email" }
      ]
    });

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// CHECK FAVORITE STATUS
const checkFavoriteStatus = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user._id,
      postId: req.params.postId
    });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET FAVORITE COUNT
const getFavoriteCount = async (req, res) => {
  try {
    const count = await Favorite.countDocuments({
      postId: req.params.postId
    });

    res.status(200).json({
      success: true,
      favoriteCount: count
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  toggleFavorite,
  getMyFavorites,
  checkFavoriteStatus,
  getFavoriteCount
};