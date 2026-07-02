const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const enquiryController = require("../controllers/enquiry.controller");

// CREATE ENQUIRY
router.post(
  "/",
  protect,
  enquiryController.createEnquiry
);

// MY ENQUIRIES
router.get(
  "/me",
  protect,
  enquiryController.getMyEnquiries
);

// BUSINESS ENQUIRIES
router.get(
  "/business/:businessId",
  protect,
  enquiryController.getBusinessEnquiries
);

// ENQUIRY COUNT
router.get(
  "/business/:businessId/count",
  protect,
  enquiryController.getEnquiryCount
);

// UPDATE STATUS
router.put(
  "/:enquiryId/status",
  protect,
  enquiryController.updateEnquiryStatus
);

// DELETE ENQUIRY
router.delete(
  "/:enquiryId",
  protect,
  enquiryController.deleteEnquiry
);

module.exports = router;