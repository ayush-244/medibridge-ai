const express = require("express");

const {
  getReservations,
  getReservationById,
} = require("../controllers/reservation.controller");

const router = express.Router();

router.get("/", getReservations);
router.get("/:id", getReservationById);

module.exports = router;