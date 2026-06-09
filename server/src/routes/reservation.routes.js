const express = require("express");

const {
  getReservations,
  getReservationById,
} = require("../controllers/reservation.controller");

const authenticateUser = require(
  "../middleware/auth.middleware"
);

const authorize = require(
  "../middleware/role.middleware"
);

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  getReservations
);

router.get(
  "/:id",
  authenticateUser,
  authorize(
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN"
  ),
  getReservationById
);

module.exports = router;