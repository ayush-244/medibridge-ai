const express = require("express");

const {
  getDoctorDashboard,
} = require("../controllers/doctorDashboard.controller");

const authenticateUser = require(
  "../middleware/auth.middleware"
);

const authorize = require(
  "../middleware/role.middleware"
);

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  authorize("DOCTOR"),
  getDoctorDashboard
);

module.exports = router;