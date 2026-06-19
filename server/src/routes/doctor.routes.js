const express = require("express");

const {
  createDoctor,
  getDoctors,
  getDoctorsByHospital,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  updateDoctor,
} = require("../controllers/doctor.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  createDoctor,
);

router.get(
  "/pending",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  getPendingDoctors,
);

router.post(
  "/approve/:userId",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  approveDoctor,
);

router.post(
  "/reject/:userId",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  rejectDoctor,
);

router.get(
  "/",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  getDoctors,
);

router.get(
  "/hospital/:hospitalId",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  getDoctorsByHospital,
);

router.patch(
  "/:id",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  updateDoctor,
);

module.exports = router;
