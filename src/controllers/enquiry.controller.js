const Enquiry = require("../models/Enquiry");

const createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create({
      userId: req.user._id,
      businessId: req.body.businessId,
      message: req.body.message
    });

    res.status(201).json({
      success: true,
      message: "Enquiry Sent Successfully",
      data: enquiry
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMyEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      userId: req.user._id
    }).populate("businessId");

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBusinessEnquiries = async (req, res) => {
  try {

    const enquiries = await Enquiry.find({
      businessId: req.params.businessId
    })
      .populate("userId", "fullName mobile email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const updateEnquiryStatus = async (req, res) => {
  try {

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.enquiryId,
      {
        status: req.body.status
      },
      {
        new: true
      }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully",
      data: enquiry
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
};

const deleteEnquiry = async (req, res) => {
  try {

    const enquiry = await Enquiry.findOneAndDelete({
      _id: req.params.enquiryId,
      userId: req.user._id
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getEnquiryCount = async (req, res) => {
  try {

    const count = await Enquiry.countDocuments({
      businessId: req.params.businessId
    });

    res.status(200).json({
      success: true,
      enquiryCount: count
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  createEnquiry,
  getMyEnquiries,
  getBusinessEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiryCount
};