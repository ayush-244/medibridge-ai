const BedReservation = require("../models/BedReservation");

const getReservations = async (req, res) => {
  try {
    let query = {};

    if (
      req.user.role ===
      "HOSPITAL_ADMIN"
    ) {
      query = {
        hospital:
          req.user.hospital,
      };
    }

    const reservations =
      await BedReservation.find(
        query
      )
        .populate(
          "doctor",
          "name specialization"
        )
        .populate(
          "hospital",
          "name city"
        )
        .populate(
          "referral",
          "patientName"
        );

    res.status(200).json({
      success: true,
      count:
        reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Server Error",
    });
  }
};

const getReservationById = async (
  req,
  res
) => {
  try {
    const reservation =
      await BedReservation.findById(
        req.params.id
      )
        .populate(
          "doctor",
          "name specialization"
        )
        .populate(
          "hospital",
          "name city"
        )
        .populate(
          "referral",
          "patientName"
        );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message:
          "Reservation not found",
      });
    }

    if (
      req.user.role ===
        "HOSPITAL_ADMIN" &&
      reservation.hospital._id.toString() !==
        req.user.hospital
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
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
      message:
        "Server Error",
    });
  }
};

module.exports = {
  getReservations,
  getReservationById,
};