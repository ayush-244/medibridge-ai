const express = require("express");

const {
  getBestHospital,
} = require("../controllers/recommendation.controller");

const router = express.Router();

router.get("/best-hospital", getBestHospital);

module.exports = router;