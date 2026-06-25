const express = require("express");
const multer = require("multer");

const {
  createReferral,
  getAllReferrals,
  getReferralById,
  getReviewData,
  getAiSummary,
  acceptReferral,
  smartAcceptReferral,
  rejectReferral,
  completeReferral,
} = require("../controllers/referral.controller");

const {
  getSpecialistRecommendation,
  getHospitalRecommendations,
  getAiSpecialist,
  getAiHospitals,
  uploadReferralDocument,
  pdfUpload,
  extractReferralData,
} = require("../controllers/referralRecommendations.controller");

const { getReferralTimeline } = require("../controllers/timeline.controller");

const {
  getReferralDocuments,
  uploadReferralDocument: uploadDoc,
  deleteReferralDocument,
  downloadReferralDocument,
  replaceReferralDocument,
} = require("../controllers/document.controller");

const authenticateUser = require(
  "../middleware/auth.middleware"
);

const authorize = require(
  "../middleware/role.middleware"
);

const router = express.Router();

// Create Referral
router.post(
  "/",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  createReferral
);

// Get All Referrals
router.get(
  "/",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  getAllReferrals
);

// Get Single Referral
router.get(
  "/:id",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  getReferralById
);

// Get Review Data
router.get(
  "/:id/review",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  getReviewData
);

// Get AI Summary
router.get(
  "/:id/ai-summary",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  getAiSummary
);

// Smart Accept Referral (with doctor + bed selection)
router.post(
  "/:id/smart-accept",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  smartAcceptReferral
);

// Accept Referral
router.patch(
  "/:id/accept",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  acceptReferral
);

// Reject Referral
router.patch(
  "/:id/reject",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  rejectReferral
);

// Complete Referral
router.patch(
  "/:id/complete",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  completeReferral
);

// AI: Pre-referral Specialist Recommendation (no referralId required)
router.post(
  "/ai-specialist",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  getAiSpecialist
);

// AI: Pre-referral Hospital Recommendations (no referralId required)
router.post(
  "/ai-hospitals",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  getAiHospitals
);

// AI: Extract referral data from clinical documents
router.post(
  "/extract",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  extractReferralData
);

// AI: Specialist Recommendation (BFF — no manual IDs required)
router.post(
  "/:referralId/recommendations/specialist",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  getSpecialistRecommendation
);

// AI: Hospital Recommendations (BFF — no manual IDs required)
router.post(
  "/:referralId/recommendations/hospitals",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  getHospitalRecommendations
);

// List Documents for a Referral
router.get(
  "/:id/documents",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR",
    "DOCTOR"
  ),
  getReferralDocuments
);

// Upload Document to Referral
router.post(
  "/:id/documents",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
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
  uploadDoc
);

// Download Document
router.get(
  "/:id/documents/:documentId/download",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR",
    "DOCTOR"
  ),
  downloadReferralDocument
);

// Replace Document
router.put(
  "/:id/documents/:documentId/replace",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
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
  replaceReferralDocument
);

// Delete Document
router.delete(
  "/:id/documents/:documentId",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  deleteReferralDocument
);

// Get Referral Timeline
router.get(
  "/:id/timeline",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR"
  ),
  getReferralTimeline
);

module.exports = router;