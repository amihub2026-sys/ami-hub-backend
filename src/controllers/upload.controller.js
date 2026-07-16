const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3 = new S3Client({
  region: "auto",

  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

  forcePathStyle: true,

  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

exports.uploadR2 = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const folder = req.body.folder || "uploads";

const safeFileName = file.originalname.replace(
  /[^a-zA-Z0-9._-]/g,
  "-"
);

const fileName =
  `${folder}/${Date.now()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
    res.json({ success: true, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};