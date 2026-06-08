const express = require("express");

const {
  getPendingUsers,
  approveUser,
} = require("../controllers/admin.controller");

const authenticateUser = require(
  "../middleware/auth.middleware"
);

const authorize = require(
  "../middleware/role.middleware"
);

const router = express.Router();

router.get(
  "/pending-users",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  getPendingUsers
);

router.patch(
  "/users/:id/approve",
  authenticateUser,
  authorize("SUPER_ADMIN"),
  approveUser
);

module.exports = router;