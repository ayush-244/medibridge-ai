const express = require("express");

const {
  createDoctor,
  getDoctors,
  getDoctorsByHospital,
} = require("../controllers/doctor.controller");

const authenticateUser = require(
  "../middleware/auth.middleware"
);

const authorize = require(
  "../middleware/role.middleware"
);

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  createDoctor
);

router.get(
  "/",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  getDoctors
);

router.get(
  "/hospital/:hospitalId",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  getDoctorsByHospital
);

module.exports = router;