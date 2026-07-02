const Post = require("../models/post.model");

const makeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

const createPost = async (req, res) => {
  try {
    const { title, categoryId } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category is required"
      });
    }

    const slug = `${makeSlug(title)}-${Date.now()}`;

    const post = await Post.create({
      ...req.body,
      slug,
      sellerId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {

    const {
      keyword,
      categoryId,
      subcategoryId,
      listingType,
      city,
      state,
      minPrice,
      maxPrice,
      isFeatured,
      sort
    } = req.query;

    const filter = {};

    // Keyword Search
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    // Category
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Sub Category
    if (subcategoryId) {
      filter.subcategoryId = subcategoryId;
    }

    // Product / Service
    if (listingType) {
      filter.listingType = listingType;
    }

    // City
    if (city) {
      filter["location.city"] = {
        $regex: city,
        $options: "i"
      };
    }

    // State
    if (state) {
      filter["location.state"] = {
        $regex: state,
        $options: "i"
      };
    }

    // Price Range
    if (minPrice || maxPrice) {

      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }

    }

    // Featured
    if (isFeatured === "true") {
      filter.isFeatured = true;
    }

    let query = Post.find(filter)
      .populate("sellerId", "fullName mobile email")
      .populate("categoryId", "categoryName slug type")
      .populate("subcategoryId", "subcategoryName slug");

    // Sorting
    switch (sort) {

      case "priceLow":
        query = query.sort({ price: 1 });
        break;

      case "priceHigh":
        query = query.sort({ price: -1 });
        break;

      case "popular":
        query = query.sort({
          viewsCount: -1,
          favoritesCount: -1
        });
        break;

      case "rating":
        query = query.sort({
          ratingAverage: -1
        });
        break;

      default:
        query = query.sort({
          createdAt: -1
        });

    }

    const posts = await query;

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
const getPostById = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate("sellerId", "fullName mobile email")
      .populate("categoryId", "categoryName slug type")
      .populate("subcategoryId", "subcategoryName slug");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadPostMedia = async (req, res) => {
  try {
    console.log("FILES:", req.files);

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No media file uploaded"
      });
    }

    const imageUrls = [];
    const videoUrls = [];

    req.files.forEach((file) => {
      const fileUrl = `/uploads/posts/${file.filename}`;

      if (file.mimetype.startsWith("image/")) {
        imageUrls.push(fileUrl);
      }

      if (file.mimetype.startsWith("video/")) {
        videoUrls.push(fileUrl);
      }
    });

    post.images.push(...imageUrls);
    post.videos.push(...videoUrls);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Media uploaded successfully",
      data: post
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const addPostView = async (req, res) => {
  try {

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Don't count seller's own views
    if (
      req.user &&
      post.sellerId.toString() === req.user._id.toString()
    ) {
      return res.status(200).json({
        success: true,
        message: "Seller view ignored",
        viewsCount: post.viewsCount
      });
    }

    // Count only unique viewers
    if (
      req.user &&
      !post.uniqueViewers.includes(req.user._id)
    ) {
      post.uniqueViewers.push(req.user._id);
      post.viewsCount += 1;
      await post.save();
    }

    res.status(200).json({
      success: true,
      message: "View counted",
      viewsCount: post.viewsCount
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getPostAnalytics = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (post.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this analytics"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        postId: post._id,
        title: post.title,
        viewsCount: post.viewsCount,
        uniqueViewers: post.uniqueViewers.length,
        favoritesCount: post.favoritesCount,
        reviewsCount: post.reviewsCount,
        ratingAverage: post.ratingAverage
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMyPostAnalytics = async (req, res) => {
  try {
    const posts = await Post.find({ sellerId: req.user._id })
      .select(
        "title images price viewsCount uniqueViewers favoritesCount reviewsCount ratingAverage status isFeatured isBoosted createdAt"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts.map((post) => ({
        postId: post._id,
        title: post.title,
        image: post.images?.[0] || "",
        price: post.price,
        status: post.status,
        isFeatured: post.isFeatured,
        isBoosted: post.isBoosted,
        viewsCount: post.viewsCount,
        uniqueViewers: post.uniqueViewers.length,
        favoritesCount: post.favoritesCount,
        reviewsCount: post.reviewsCount,
        ratingAverage: post.ratingAverage,
        createdAt: post.createdAt
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  uploadPostMedia,
  addPostView,
  getPostAnalytics,
  getMyPostAnalytics
};