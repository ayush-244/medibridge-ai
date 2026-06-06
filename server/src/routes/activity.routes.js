const express = require("express");

const {
  getActivities,
} = require("../controllers/activity.controller");

const router = express.Router();

router.get("/", getActivities);

module.exports = router;