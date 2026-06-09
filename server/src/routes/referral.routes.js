const express = require("express");

const {
  createReferral,
  getAllReferrals,
  acceptReferral,
  rejectReferral,
  completeReferral,
} = require("../controllers/referral.controller");

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

module.exports = router;