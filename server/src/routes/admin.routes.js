const express = require("express");

const {
  getPendingUsers,
  approveUser,
  getPendingHospitals,
  getPendingHospitalAdmins,
  approveHospital,
  rejectHospital,
  approveHospitalAdmin,
  rejectHospitalAdmin,
} = require("../controllers/admin.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/pending-users",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getPendingUsers,
);

router.patch(
  "/users/:id/approve",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  approveUser,
);

router.get(
  "/pending-hospitals",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getPendingHospitals,
);

router.get(
  "/pending-hospital-admins",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getPendingHospitalAdmins,
);

router.post(
  "/approve-hospital/:userId",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  approveHospital,
);

router.post(
  "/reject-hospital/:userId",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  rejectHospital,
);

router.post(
  "/approve-hospital-admin/:userId",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  approveHospitalAdmin,
);

router.post(
  "/reject-hospital-admin/:userId",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  rejectHospitalAdmin,
);

module.exports = router;
