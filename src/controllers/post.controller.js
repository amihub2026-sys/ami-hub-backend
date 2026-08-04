const Post = require("../models/post.model");
const Category = require("../models/category.model");
const UserSubscription = require("../models/userSubscription.model");
const mongoose = require("mongoose");
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
    const { title, categoryId, listingType } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

if (!listingType) {
  return res.status(400).json({
    success: false,
    message: "Listing type is required"
  });
}

/*
  Category is required only for
  product and service listings.
*/
if (
  listingType === "product" ||
  listingType === "service"
) {
  if (!categoryId) {
    return res.status(400).json({
      success: false,
      message: "Category is required"
    });
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    return res.status(400).json({
      success: false,
      message: "Category not found"
    });
  }

  if (
    !category.availableIn ||
    !category.availableIn.includes(listingType)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "This category is not available for this listing type"
    });
  }
}
const now = new Date();

const subscription = await UserSubscription.findOne({
  userId: req.user._id,
  status: "active",
  expiryDate: { $gte: now }
}).sort({
  createdAt: -1
});

if (!subscription) {
  return res.status(402).json({
    success: false,
    requiresPayment: true,
    message:
      "You don't have an active subscription."
  });
}

if (subscription.remainingPosts <= 0) {
  return res.status(402).json({
    success: false,
    requiresPayment: true,
    message:
      "Your post limit has been reached. Please purchase another plan."
  });
}
    const slug = `${makeSlug(title)}-${Date.now()}`;

const post = await Post.create({
  ...req.body,

  slug,

  sellerId: req.user._id,

  // Payment is already covered by the subscription.
  // The post can now wait for admin approval.
  status: "pending"
});
subscription.remainingPosts =
  Math.max(
    0,
    Number(subscription.remainingPosts || 0) - 1
  );

await subscription.save();
return res.status(201).json({
  success: true,

  requiresPayment: false,

  message:
    "Post created successfully and sent for admin approval.",

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
// Category
if (categoryId) {

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID"
    });
  }

  filter.categoryId =
    new mongoose.Types.ObjectId(categoryId);
}

    // Sub Category
// Sub Category
if (subcategoryId) {

  if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid subcategory ID"
    });
  }

  filter.subcategoryId =
    new mongoose.Types.ObjectId(subcategoryId);
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
const getMyPosts = async (req,res)=>{

  try {

    const posts = await Post.find({
      sellerId:req.user._id
    })
    .populate(
      "categoryId",
      "categoryName"
    )
    .populate(
      "subcategoryId",
      "subcategoryName"
    )
    .sort({
      createdAt:-1
    });


    res.status(200).json({

      success:true,
      count:posts.length,
      data:posts

    });


  } catch(error){

    res.status(500).json({

      success:false,
      message:error.message

    });

  }

};
const getAdminPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("sellerId", "fullName mobile email")
      .populate("categoryId", "categoryName")
      .populate("subcategoryId", "subcategoryName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error("Get admin posts error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateAdminPostStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    post.status = isActive ? "approved" : "rejected";

    await post.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Post enabled successfully"
        : "Post disabled successfully",
      data: post
    });
  } catch (error) {
    console.error("Update admin post status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateAdminPostFeatured = async (req, res) => {
  try {
    const { isFeatured } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        isFeatured: Boolean(isFeatured)
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: post.isFeatured
        ? "Post marked as featured"
        : "Post removed from featured",
      data: post
    });
  } catch (error) {
    console.error("Update featured status error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteAdminPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(
      req.params.id
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error) {
    console.error("Delete admin post error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const allowedFields = [
      "title",
      "description",
      "price",
      "categoryId",
      "subcategoryId",
      "listingType",
      "location",
      "customFields",
      "images",
      "videos",
      "isFeatured",
      "featuredPlanId",
      "featuredPlanName",
      "status",
      "isActive"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post
    });
  } catch (error) {
    console.error("Update post error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const getSellerPosts = async (req,res)=>{

  try{

    const posts = await Post.find({
      sellerId:req.params.sellerId
    })
.populate(
 "sellerId",
 "fullName mobile email image"
)
    .populate(
      "categoryId",
      "categoryName"
    )
    .populate(
      "subcategoryId",
      "subcategoryName"
    )
    .sort({
      createdAt:-1
    });


    res.status(200).json({

      success:true,

      count:posts.length,

      data:posts

    });


  }
  catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};
module.exports = {

  createPost,

  getPosts,

  getPostById,

  getSellerPosts,

  getMyPostAnalytics,

  getPostAnalytics,

  getMyPosts,

  getAdminPosts,

  updateAdminPostStatus,

  updateAdminPostFeatured,

  deleteAdminPost,

  updatePost,

  uploadPostMedia,

  addPostView

};