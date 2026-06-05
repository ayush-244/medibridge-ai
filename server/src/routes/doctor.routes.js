const express = require("express");

const {
  createDoctor,
  getDoctors,
  getDoctorsByHospital,
} = require("../controllers/doctor.controller");

const router = express.Router();

router.post("/", createDoctor);

router.get("/", getDoctors);

router.get(
  "/hospital/:hospitalId",
  getDoctorsByHospital
);

module.exports = router;