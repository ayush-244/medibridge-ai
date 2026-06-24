const express = require("express");
const multer = require("multer");

const {
  createReferral,
  getAllReferrals,
  acceptReferral,
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

// Upload clinical document (PDF) scoped to this referral
router.post(
  "/:referralId/documents/upload",
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
  uploadReferralDocument
);

module.exports = router;