const express = require("express");

const {
  getDashboardStats,
} = require("../controllers/dashboard.controller");

const authenticateUser = require(
  "../middleware/auth.middleware"
);

const authorize = require(
  "../middleware/role.middleware"
);

const router = express.Router();

router.get(
  "/stats",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  getDashboardStats
);

module.exports = router;