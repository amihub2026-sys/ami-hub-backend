const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const businessController = require("../controllers/business.controller");

// CREATE
router.post(
  "/",
  protect,
  upload.array("images", 5),
  businessController.createBusiness
);

// PUBLIC LIST
router.get("/", businessController.getAllBusinesses);

router.get("/search", businessController.searchBusinesses);

router.get("/me", protect, businessController.getMyBusinesses);

router.get("/:id", businessController.getBusinessDetails);

router.put(
  "/:id",
  protect,
  upload.array("images", 5),
  businessController.updateBusiness
);

router.put(
  "/:id/status",
  protect,
  businessController.updateBusinessStatus
);

router.delete(
  "/:id",
  protect,
  businessController.deleteBusiness
);

module.exports = router;