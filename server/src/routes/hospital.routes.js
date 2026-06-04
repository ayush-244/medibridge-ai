const express = require("express");

const {
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateBeds,
} = require("../controllers/hospital.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");

const router = express.Router();

// Create Hospital
router.post(
  "/",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  createHospital
);

// Get All Hospitals
router.get(
  "/",
  authenticateUser,
  getAllHospitals
);

// Get Hospital By ID
router.get(
  "/:id",
  authenticateUser,
  getHospitalById
);

// Update Bed Availability
router.patch(
  "/:id/beds",
  authenticateUser,
  authorizeRoles(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  updateBeds
);

module.exports = router;