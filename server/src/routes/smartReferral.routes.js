const express = require("express");

const {
  createSmartReferral,
  createEmergencyReferral,
} = require(
  "../controllers/smartReferral.controller"
);

const router = express.Router();

router.post(
  "/",
  createSmartReferral
);

router.post(
  "/emergency",
  createEmergencyReferral
);

module.exports = router;