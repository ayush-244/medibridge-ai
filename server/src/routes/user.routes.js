const express = require("express");

const {
  getUsers,
  getUserById,
  deactivateUser,
} = require("../controllers/user.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  getUsers,
);

router.get(
  "/:id",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  getUserById,
);

router.patch(
  "/:id/deactivate",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  deactivateUser,
);

module.exports = router;
