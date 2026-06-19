const express = require("express");

const {
  createHospital,
  getAllHospitals,
  getHospitalById,
  getNearbyHospitals,
  getApprovedHospitals,
  updateBeds,
  updateHospital,
} = require("../controllers/hospital.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");

const router = express.Router();

// Public: approved hospitals for doctor self-registration
router.get("/approved", getApprovedHospitals);

// Create Hospital
router.post(
  "/",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN"),
  createHospital
);

// Get All Hospitals
router.get(
  "/",
  authenticateUser,
  getAllHospitals
);

// Nearby Hospitals (must be before /:id)
router.get(
  "/nearby",
  authenticateUser,
  getNearbyHospitals
);

// Get Hospital By ID
router.get(
  "/:id",
  authenticateUser,
  getHospitalById
);

// Update Hospital
router.patch(
  "/:id",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN"),
  updateHospital
);

// Update Bed Availability
router.patch(
  "/:id/beds",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN"),
  updateBeds
);

module.exports = router;