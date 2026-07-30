const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const sellerAdminController = require("../controllers/sellerAdmin.controller");


router.get(
    "/sellers",
    protect,
    sellerAdminController.getAllSellers
);


router.get(
    "/sellers/:id",
    protect,
    sellerAdminController.getSellerById
);
router.put(
    "/sellers/:id/remove",
    protect,
    sellerAdminController.removeSeller
);

module.exports = router;