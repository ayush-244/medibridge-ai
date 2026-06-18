const express = require("express");

const {
  triagePatient,
  emergencyRecommendation,
  getMatchingData,
  getReferralData,
} = require("../controllers/ai.controller");

const router = express.Router();

// AI Triage
router.post("/triage", triagePatient);

// AI Emergency Recommendation
router.post(
  "/emergency-recommendation",
  emergencyRecommendation
);

// Get Matching Data
router.get("/matching-data", getMatchingData);

// Get Referral Data
router.get("/referral/:referralId", getReferralData);

module.exports = router;