const express = require("express");
const router = express.Router();

const upload =
  require("../middlewares/upload.middleware");

const heroSliderController =
  require("../controllers/heroSlider.controller");

router.get(
  "/",
  heroSliderController.getHeroSliders
);

router.post(
  "/",
  upload.fields([
    {
      name: "desktopImage",
      maxCount: 1
    },
    {
      name: "mobileImage",
      maxCount: 1
    }
  ]),
  heroSliderController.createHeroSlider
);

router.delete(
  "/:id",
  heroSliderController.deleteHeroSlider
);

module.exports = router;