const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const protect = require("../middlewares/auth.middleware");
const uploadPostMedia = require("../middlewares/upload.middleware");

router.post("/", protect, postController.createPost);

router.post(
  "/:id/media",
  protect,
  uploadPostMedia.array("media", 10),
  postController.uploadPostMedia
);

router.get("/", postController.getPosts);

router.get(
  "/seller/analytics",
  protect,
  postController.getMyPostAnalytics
);

router.post(
  "/:postId/view",
  protect,
  postController.addPostView
);

router.get(
  "/:postId/analytics",
  protect,
  postController.getPostAnalytics
);
router.get(
 "/my-posts",
 protect,
 postController.getMyPosts
);
router.get("/:id", postController.getPostById);

module.exports = router;