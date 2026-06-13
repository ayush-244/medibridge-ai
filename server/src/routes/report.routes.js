const express = require("express");
const {
  getSystemSummary,
  getHospitalSummary,
  getDoctorSummary,
  getReferralSummary,
  getHospitalAnalytics,
  getTopHospitals,
} = require("../controllers/report.controller");


const authenticateUser = require(
  "../middleware/auth.middleware"
);

const authorize = require(
  "../middleware/role.middleware"
);



const router = express.Router();

router.get(
  "/hospital-summary",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getHospitalSummary
);

router.get(
  "/hospital/:hospitalId",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getHospitalAnalytics
);

router.get(
  "/top-hospitals",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getTopHospitals
);

router.get(
  "/system-summary",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getSystemSummary
);

router.get(
  "/doctor-summary",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getDoctorSummary
);

router.get(
  "/referral-summary",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getReferralSummary
);



module.exports = router;





