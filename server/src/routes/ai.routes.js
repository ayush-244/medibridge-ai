const express = require("express");
const {
  triagePatient,
} = require("../controllers/ai.controller");

const router = express.Router();

router.post("/triage", triagePatient);

module.exports = router;