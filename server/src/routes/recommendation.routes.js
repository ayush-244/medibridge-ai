const express = require("express");

const {
  getBestHospital,
  getNearbyHospitals,
} = require("../controllers/recommendation.controller");

const router = express.Router();

// Best Hospital Recommendation
router.get("/best-hospital", getBestHospital);

// Nearby Hospitals
router.get("/nearby", getNearbyHospitals);

module.exports = router;