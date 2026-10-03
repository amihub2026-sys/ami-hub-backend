const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

require("dotenv").config();

const HeroSlider =
  require("../models/heroSlider.model");


// ======================================
// CLOUDFLARE R2 CLIENT
// ======================================

const s3 = new S3Client({
  region: "auto",

  endpoint:
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

  forcePathStyle: true,

  credentials: {
    accessKeyId:
      process.env.R2_ACCESS_KEY_ID,

    secretAccessKey:
      process.env.R2_SECRET_ACCESS_KEY,
  },
});


// ======================================
// HELPER - UPLOAD FILE TO R2
// ======================================

async function uploadFileToR2(
  file,
  folder
) {

  const safeFileName =
    file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    );

  const fileName =
    `${folder}/${Date.now()}-${safeFileName}`;

  const command =
    new PutObjectCommand({

      Bucket:
        process.env.R2_BUCKET,

      Key:
        fileName,

      Body:
        file.buffer,

      ContentType:
        file.mimetype,

    });

  await s3.send(command);


  const baseUrl =
    process.env.R2_PUBLIC_URL
      .replace(/\/$/, "");


  return {

    key:
      fileName,

    url:
      `${baseUrl}/${fileName}`,

  };
}


// ======================================
// GET ALL HERO SLIDERS - ADMIN
// ======================================

exports.getHeroSliders = async (
  req,
  res
) => {

  try {

    const sliders =
      await HeroSlider
        .find()
        .sort({
          displayOrder: 1,
          createdAt: -1,
        });


    return res.json({

      success: true,

      data:
        sliders,

    });


  } catch (error) {

    console.error(
      "Get Hero Sliders Error:",
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        message:
          error.message ||
          "Failed to load hero sliders",

      });

  }

};


// ======================================
// GET ACTIVE HERO SLIDERS - HOME
// ======================================

exports.getActiveHeroSliders = async (
  req,
  res
) => {

  try {

    const sliders =
      await HeroSlider
        .find({
          active: true,
        })
        .sort({
          displayOrder: 1,
          createdAt: -1,
        });


    return res.json({

      success: true,

      data:
        sliders,

    });


  } catch (error) {

    console.error(
      "Get Active Hero Sliders Error:",
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        message:
          error.message ||
          "Failed to load active hero sliders",

      });

  }

};


// ======================================
// CREATE HERO SLIDER
// MULTIPLE BANNERS ALLOWED
// ======================================

exports.createHeroSlider = async (
  req,
  res
) => {

  try {

    const desktopImage =
      req.files?.desktopImage?.[0];

    const mobileImage =
      req.files?.mobileImage?.[0];


    if (!desktopImage) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Desktop image is required",

        });

    }


    if (!mobileImage) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Mobile image is required",

        });

    }


    // ======================================
    // 1. UPLOAD DESKTOP IMAGE TO R2
    // ======================================

    const desktopUpload =
      await uploadFileToR2(
        desktopImage,
        "hero-slider/desktop"
      );


    // ======================================
    // 2. UPLOAD MOBILE IMAGE TO R2
    // ======================================

    const mobileUpload =
      await uploadFileToR2(
        mobileImage,
        "hero-slider/mobile"
      );


    // ======================================
    // 3. SAVE NEW BANNER IN MONGODB
    // OLD BANNERS ARE NOT DELETED
    // ======================================

    const slider =
      await HeroSlider.create({

        desktopImage:
          desktopUpload.url,

        desktopKey:
          desktopUpload.key,

        mobileImage:
          mobileUpload.url,

        mobileKey:
          mobileUpload.key,

        displayOrder:
          Number(
            req.body.displayOrder || 0
          ),

        active:
          String(
            req.body.active
          ) !== "false",

      });


    // ======================================
    // 4. RETURN RESPONSE
    // ======================================

    return res
      .status(201)
      .json({

        success: true,

        message:
          "Hero banner uploaded successfully",

        data:
          slider,

      });


  } catch (error) {

    console.error(
      "Create Hero Slider Error:",
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        message:
          error.message ||
          "Failed to upload hero banner",

      });

  }

};


// ======================================
// DELETE SINGLE HERO SLIDER
// ======================================

exports.deleteHeroSlider = async (
  req,
  res
) => {

  try {

    const slider =
      await HeroSlider.findById(
        req.params.id
      );


    if (!slider) {

      return res
        .status(404)
        .json({

          success: false,

          message:
            "Hero slider not found",

        });

    }


    // ======================================
    // DELETE DESKTOP IMAGE FROM R2
    // ======================================

    if (
      slider.desktopKey
    ) {

      try {

        await s3.send(

          new DeleteObjectCommand({

            Bucket:
              process.env.R2_BUCKET,

            Key:
              slider.desktopKey,

          })

        );

      } catch (error) {

        console.error(
          "Desktop image delete error:",
          error
        );

      }

    }


    // ======================================
    // DELETE MOBILE IMAGE FROM R2
    // ======================================

    if (
      slider.mobileKey
    ) {

      try {

        await s3.send(

          new DeleteObjectCommand({

            Bucket:
              process.env.R2_BUCKET,

            Key:
              slider.mobileKey,

          })

        );

      } catch (error) {

        console.error(
          "Mobile image delete error:",
          error
        );

      }

    }


    // ======================================
    // DELETE ONLY THIS MONGODB RECORD
    // ======================================

    await HeroSlider.findByIdAndDelete(
      req.params.id
    );


    return res.json({

      success: true,

      message:
        "Hero banner deleted successfully",

    });


  } catch (error) {

    console.error(
      "Delete Hero Slider Error:",
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        message:
          error.message ||
          "Failed to delete hero banner",

      });

  }

};