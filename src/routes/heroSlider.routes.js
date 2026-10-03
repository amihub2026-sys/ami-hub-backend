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


const router = express.Router();

const heroSliderController =
  require("../controllers/heroSlider.controller");

const upload =
  require("../middlewares/upload.middleware");


// ==============================
// CREATE HERO SLIDER
// ==============================

router.post(
  "/",
  upload.fields([
    {
      name: "desktopImage",
<
      maxCount: 1
    },
    {
      name: "mobileImage",
      maxCount: 1
    }
      maxCount: 1,
    },
    {
      name: "mobileImage",
      maxCount: 1,
    },

  ]),
  heroSliderController.createHeroSlider
);



// ==============================
// GET ALL - ADMIN
// ==============================

router.get(
  "/admin",
  heroSliderController.getAllHeroSliders
);


// ==============================
// GET ACTIVE - HOME
// ==============================

router.get(
  "/",
  heroSliderController.getActiveHeroSliders
);


// ==============================
// DELETE
// ==============================


router.delete(
  "/:id",
  heroSliderController.deleteHeroSlider
);


module.exports = router;