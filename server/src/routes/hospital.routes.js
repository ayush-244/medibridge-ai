const express = require("express");

const {
  createHospital,
} = require("../controllers/hospital.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  createHospital
);

module.exports = router;