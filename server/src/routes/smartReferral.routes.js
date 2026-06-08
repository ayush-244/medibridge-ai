const express = require("express");

const {
  createSmartReferral,
} = require(
  "../controllers/smartReferral.controller"
);

const router = express.Router();

router.post(
  "/",
  createSmartReferral
);

module.exports = router;