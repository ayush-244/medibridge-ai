const BedReservation = require("../models/BedReservation");
const {
  patientArrived,
  extendReservation,
  cancelReservation,
  completeReservation,
  VALID_DURATIONS,
} = require("../services/reservationActions.service");

const populateReservation = (query) =>
  query
    .populate("doctor", "name specialization")
    .populate("hospital", "name city")
    .populate("referral", "patientName");

const getReservations = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "HOSPITAL_ADMIN") {
      query = {
        hospital: req.user.hospital,
      };
    }

    const reservations = await populateReservation(
      BedReservation.find(query),
    ).exec();

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getReservationById = async (req, res) => {
  try {
    const reservation = await populateReservation(
      BedReservation.findById(req.params.id),
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (
      req.user.role === "HOSPITAL_ADMIN" &&
      reservation.hospital._id.toString() !== req.user.hospital
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const markPatientArrived = async (req, res) => {
  try {
    const reservation = await patientArrived(
      req.params.id,
      req.user.id,
    );

    const populated = await populateReservation(
      BedReservation.findById(reservation._id),
    );

    res.status(200).json({
      success: true,
      message: "Patient marked as arrived",
      data: populated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const extendReservationHandler = async (req, res) => {
  try {
    const { durationHours } = req.body;

    if (!durationHours || !VALID_DURATIONS.includes(durationHours)) {
      return res.status(400).json({
        success: false,
        message: `Duration must be one of: ${VALID_DURATIONS.join(", ")} hours`,
      });
    }

    const reservation = await extendReservation(
      req.params.id,
      durationHours,
      req.user.id,
    );

    const populated = await populateReservation(
      BedReservation.findById(reservation._id),
    );

    res.status(200).json({
      success: true,
      message: "Reservation extended successfully",
      data: populated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelReservationHandler = async (req, res) => {
  try {
    const reservation = await cancelReservation(
      req.params.id,
      req.user.id,
    );

    const populated = await populateReservation(
      BedReservation.findById(reservation._id),
    );

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      data: populated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const completeReservationHandler = async (req, res) => {
  try {
    const reservation = await completeReservation(
      req.params.id,
      req.user.id,
    );

    const populated = await populateReservation(
      BedReservation.findById(reservation._id),
    );

    res.status(200).json({
      success: true,
      message: "Reservation completed successfully",
      data: populated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getReservations,
  getReservationById,
  markPatientArrived,
  extendReservationHandler,
  cancelReservationHandler,
  completeReservationHandler,
};
