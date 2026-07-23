const express = require("express");

const router = express.Router();


const controller =
require("../controllers/subscription.controller");


const auth =
require("../middlewares/auth.middleware");



router.post(
"/create",
auth,
controller.createSubscription
);



module.exports = router;