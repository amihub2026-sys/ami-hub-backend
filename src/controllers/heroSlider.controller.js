
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

require("dotenv").config();

const HeroSlider = require("../models/heroSlider.model");

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


// ===============================
// UPLOAD TO CLOUDFLARE R2
// ===============================

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
      Bucket: process.env.R2_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

  await s3.send(command);

  return {
    key: fileName,

    url:
      `${process.env.R2_PUBLIC_URL}/${fileName}`,
  };
}


// ===============================
// GET ALL HERO SLIDERS
// ===============================

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
      data: sliders,
    });


  } catch (error) {

    console.error(
      "Get hero sliders error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Failed to load hero sliders",
      });

  }
};


// ===============================
// CREATE HERO SLIDER
// ===============================

exports.createHeroSlider = async (
  req,
  res
) => {

  try {

    console.log(
      "HERO FILES:",
      req.files
    );

    console.log(
      "HERO BODY:",
      req.body
    );


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


    // Upload Desktop Image

    const desktopUpload =
      await uploadFileToR2(
        desktopImage,
        "hero-slider/desktop"
      );


    // Upload Mobile Image

    const mobileUpload =
      await uploadFileToR2(
        mobileImage,
        "hero-slider/mobile"
      );


    // Save R2 URLs in MongoDB

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
          String(req.body.active)
            === "true",

      });


    return res
      .status(201)
      .json({
        success: true,
        message:
          "Hero banner uploaded successfully",
        data: slider,
      });


  } catch (error) {

    console.error(
      "Create hero slider error:",
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


// ===============================
// DELETE HERO SLIDER
// ===============================

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


    // Delete Desktop from R2

    if (slider.desktopKey) {

      await s3.send(
        new DeleteObjectCommand({
          Bucket:
            process.env.R2_BUCKET,

          Key:
            slider.desktopKey,
        })
      );

    }


    // Delete Mobile from R2

    if (slider.mobileKey) {

      await s3.send(
        new DeleteObjectCommand({
          Bucket:
            process.env.R2_BUCKET,

          Key:
            slider.mobileKey,
        })
      );

    }


    // Delete record from MongoDB

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
      "Delete hero slider error:",
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