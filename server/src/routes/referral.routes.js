const express = require("express");

const {
  createReferral,
  getAllReferrals,
  acceptReferral,
  rejectReferral,
  completeReferral,
} = require("../controllers/referral.controller");

const router = express.Router();

// Create Referral
router.post("/", createReferral);

// Get All Referrals
router.get("/", getAllReferrals);

// Accept Referral
router.patch("/:id/accept", acceptReferral);

// Reject Referral
router.patch("/:id/reject", rejectReferral);

// Complete Referral
router.patch("/:id/complete", completeReferral);

module.exports = router;