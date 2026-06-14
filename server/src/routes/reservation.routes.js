const express = require("express");

const {
  getReservations,
  getReservationById,
  markPatientArrived,
  extendReservationHandler,
  cancelReservationHandler,
  completeReservationHandler,
} = require("../controllers/reservation.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR"),
  getReservations,
);

router.get(
  "/:id",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR"),
  getReservationById,
);

router.patch(
  "/:id/arrive",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  markPatientArrived,
);

router.patch(
  "/:id/extend",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  extendReservationHandler,
);

router.patch(
  "/:id/cancel",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  cancelReservationHandler,
);

router.patch(
  "/:id/complete",
  authenticateUser,
  authorize("SUPER_ADMIN", "HOSPITAL_ADMIN"),
  completeReservationHandler,
);

module.exports = router;
