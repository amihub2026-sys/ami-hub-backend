const express = require("express");

const router = express.Router();

const controller =
require("../controllers/customFieldAssignment.controller");

const protect =
require("../middlewares/auth.middleware");


// Assign custom fields
router.post(
  "/",
  protect,
  controller.assignFields
);


// Get assigned fields
router.get(
  "/",
  protect,
  controller.getAssignedFields
);

// Admin get all assignments

router.get(
"/all",
protect,
controller.getAllAssignments
);


// Update assignment

router.put(
"/:id",
protect,
controller.updateAssignment
);
// Remove assignment
router.delete(
  "/:id",
  protect,
  controller.removeAssignment
);



module.exports = router;