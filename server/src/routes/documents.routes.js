const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  uploadTempDocument,
  reScopeDocuments,
} = require("../controllers/documents.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype !== "application/pdf" || ext !== ".pdf") {
      cb(new Error("Only PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
});

router.post(
  "/upload-temp",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN", "REFERRAL_COORDINATOR"),
  (req, res, next) => {
    pdfUpload.single("file")(req, res, (err) => {
      if (err) {
        const message =
          err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
            ? "Document must be 10 MB or smaller"
            : err.message || "Failed to upload document";
        return res.status(400).json({ success: false, message });
      }
      next();
    });
  },
  uploadTempDocument,
);

router.post(
  "/re-scope",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN", "REFERRAL_COORDINATOR"),
  reScopeDocuments,
);

module.exports = router;
