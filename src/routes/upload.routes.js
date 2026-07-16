const express = require("express");
const router = express.Router();

const uploadController =
  require("../controllers/upload.controller");

const upload =
  require("../middlewares/upload.middleware");

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Upload route working"
  });
});

router.post(
  "/r2",
  upload.single("file"),
  uploadController.uploadR2
);

module.exports = router;