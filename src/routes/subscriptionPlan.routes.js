const express = require("express");

const router = express.Router();


const controller =
require("../controllers/subscriptionPlan.controller");

const auth =
require("../middlewares/auth.middleware");



// ADMIN

router.post(
"/",
auth,
controller.createPlan
);


router.get(
"/",
auth,
controller.getPlans
);


router.put(
"/:id",
auth,
controller.updatePlan
);


router.patch(
"/:id/status",
auth,
controller.toggleStatus
);


router.delete(
"/:id",
auth,
controller.deletePlan
);



// USER

router.get(
"/active",
controller.getActivePlans
);



module.exports = router;