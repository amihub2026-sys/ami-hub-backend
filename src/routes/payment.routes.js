const express = require("express");

const router = express.Router();

const controller = require("../controllers/payment.controller");


router.post(
"/create-order",
controller.createOrder
);


router.post(
"/verify-payment",
controller.verifyPayment
);


router.post(
"/save-post",
controller.savePost
);


module.exports = router;