const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const authenticateUser = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads/doctors");
const hospitalUploadDir = path.join(__dirname, "../../uploads/hospitals");
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(hospitalUploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext === ".jpeg" ? ".jpg" : ext;
    const uniqueName = `doctor-${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${safeExt}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtension = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);

    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtension) {
      cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
      return;
    }

    cb(null, true);
  },
});

router.post(
  "/doctor-photo",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  (req, res) => {
    upload.single("photo")(req, res, (error) => {
      if (error) {
        const message =
          error instanceof multer.MulterError &&
          error.code === "LIMIT_FILE_SIZE"
            ? "Doctor photo must be 5 MB or smaller"
            : error.message || "Failed to upload doctor photo";

        return res.status(400).json({
          success: false,
          message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Doctor photo is required",
        });
      }

      return res.status(201).json({
        success: true,
        url: `/uploads/doctors/${req.file.filename}`,
      });
    });
  },
);

const hospitalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, hospitalUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext === ".jpeg" ? ".jpg" : ext;
    const uniqueName = `hospital-${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${safeExt}`;
    cb(null, uniqueName);
  },
});

const uploadHospitalLogo = multer({
  storage: hospitalStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtension = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);

    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtension) {
      cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
      return;
    }

    cb(null, true);
  },
});

router.post(
  "/hospital-logo",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  (req, res) => {
    uploadHospitalLogo.single("logo")(req, res, (error) => {
      if (error) {
        const message =
          error instanceof multer.MulterError &&
          error.code === "LIMIT_FILE_SIZE"
            ? "Hospital logo must be 5 MB or smaller"
            : error.message || "Failed to upload hospital logo";

        return res.status(400).json({
          success: false,
          message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Hospital logo is required",
        });
      }

      return res.status(201).json({
        success: true,
        url: `/uploads/hospitals/${req.file.filename}`,
      });
    });
  },
);

module.exports = router;
