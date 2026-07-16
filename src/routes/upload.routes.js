const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");
const upload = require("../middlewares/upload.middleware");

router.post("/r2", upload.single("file"), uploadController.uploadR2);

module.exports = router;