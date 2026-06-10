const express = require("express");

const {
  getSystemSummary,
} = require("../controllers/report.controller");

const authenticateUser = require(
  "../middleware/auth.middleware"
);

const authorize = require(
  "../middleware/role.middleware"
);

const router = express.Router();

router.get(
  "/system-summary",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getSystemSummary
);

module.exports = router;