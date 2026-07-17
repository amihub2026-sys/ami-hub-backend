const express = require("express");

const router = express.Router();

const controller =
require("../controllers/boostPlan.controller");


const auth =
require("../middlewares/auth.middleware");



router.post(
"/",
auth,
controller.createBoostPlan
);



router.get(
"/",
auth,
controller.getBoostPlans
);



router.put(
"/:id",
auth,
controller.updateBoostPlan
);



router.delete(
"/:id",
auth,
controller.deleteBoostPlan
);



module.exports = router;