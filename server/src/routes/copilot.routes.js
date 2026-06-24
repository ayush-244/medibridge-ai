const express = require("express");
const multer = require("multer");

const {
  COPILOT_ROLES,
  getSessions,
  getSession,
  createSession,
  sendMessage,
  getDocuments,
  getPatientSnapshot,
  getClinicalIntelligence,
  getAnalytics,
  uploadDocument,
  pdfUpload,
} = require("../controllers/copilot.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/sessions",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getSessions,
);

router.get(
  "/sessions/:id",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getSession,
);

router.post(
  "/sessions",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  createSession,
);

router.post(
  "/sessions/:id/messages",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  sendMessage,
);

router.post(
  "/documents/upload",
  authenticateUser,
  authorize(...COPILOT_ROLES),
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
  uploadDocument,
);

router.get(
  "/documents/:patientId",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getDocuments,
);

router.get(
  "/snapshot/:patientId",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getPatientSnapshot,
);

router.get(
  "/intelligence/:patientId",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getClinicalIntelligence,
);

router.get(
  "/analytics",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getAnalytics,
);

module.exports = router;
