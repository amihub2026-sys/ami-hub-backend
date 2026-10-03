
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

const HeroSlider = require("../models/heroSlider.model");

require("dotenv").config();

const s3 = new S3Client({
  region: "auto",

  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,


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
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});


// ==============================
// HELPER - UPLOAD FILE TO R2
// ==============================

const uploadFileToR2 = async (file, folder) => {

  const safeFileName = file.originalname.replace(
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


=======
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,

    Key: fileName,

    Body: file.buffer,

    ContentType: file.mimetype,
  });

  await s3.send(command);

  const publicUrl =
    `${process.env.R2_PUBLIC_URL}/${fileName}`;

  return {
    publicUrl,
    fileName,
  };
};


// ==============================
// UPLOAD HERO SLIDER
// ==============================

exports.createHeroSlider = async (req, res) => {

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

      return res.status(400).json({
        success: false,
        message: "Desktop image is required",
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

      return res.status(400).json({
        success: false,
        message: "Mobile image is required",
      });

    }



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


    const heroSlider =
      await HeroSlider.create({

        desktopImageUrl:
          desktopUpload.publicUrl,

        mobileImageUrl:
          mobileUpload.publicUrl,

        displayOrder:
          Number(req.body.displayOrder) || 0,

        active:
          req.body.active === "false"
            ? false
            : true,

      });


    return res.status(201).json({

      success: true,

      message:
        "Hero slider uploaded successfully",

      data: heroSlider,

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

      "Create Hero Slider Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


// ==============================
// GET ALL HERO SLIDERS - ADMIN
// ==============================

exports.getAllHeroSliders = async (
  req,
  res
) => {

  try {

    const heroSliders =
      await HeroSlider
        .find()
        .sort({
          displayOrder: 1,
          createdAt: -1,
        });


    return res.json({

      success: true,

      data: heroSliders,

    });

  } catch (error) {

    console.error(
      "Get Hero Sliders Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


// ==============================
// GET ACTIVE HERO SLIDERS - HOME
// ==============================

exports.getActiveHeroSliders = async (
  req,
  res
) => {

  try {

    const heroSliders =
      await HeroSlider
        .find({
          active: true,
        })
        .sort({
          displayOrder: 1,
        });


    return res.json({

      success: true,

      data: heroSliders,

    });

  } catch (error) {

    console.error(
      "Get Active Hero Sliders Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


// ==============================
// DELETE HERO SLIDER
// ==============================

exports.deleteHeroSlider = async (
  req,
  res
) => {

  try {


    const slider =

    const heroSlider =

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

    if (!heroSlider) {

      return res.status(404).json({

        success: false,

        message:
          "Hero slider not found",

      });

    }


    const deleteFromR2 =
      async (publicUrl) => {

        if (!publicUrl) return;

        const baseUrl =
          process.env.R2_PUBLIC_URL
            .replace(/\/$/, "");

        const key =
          publicUrl.replace(
            `${baseUrl}/`,
            ""
          );


        const command =
          new DeleteObjectCommand({

            Bucket:
              process.env.R2_BUCKET,

            Key: key,

          });


        await s3.send(command);

      };


    await deleteFromR2(
      heroSlider.desktopImageUrl
    );

    await deleteFromR2(
      heroSlider.mobileImageUrl
    );


    await HeroSlider.findByIdAndDelete(
      req.params.id
    );


    return res.json({

      success: true,
      message:
        "Hero banner deleted successfully",
    });



      success: true,

      message:
        "Hero slider deleted successfully",

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

      "Delete Hero Slider Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};