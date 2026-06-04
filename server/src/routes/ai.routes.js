const express = require("express");

const {
  triagePatient,
  emergencyRecommendation,
} = require("../controllers/ai.controller");

const router = express.Router();

// AI Triage
router.post("/triage", triagePatient);

// AI Emergency Recommendation
router.post(
  "/emergency-recommendation",
  emergencyRecommendation
);

module.exports = router;