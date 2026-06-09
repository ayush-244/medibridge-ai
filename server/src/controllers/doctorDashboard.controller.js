const Doctor = require("../models/Doctor");
const BedReservation = require("../models/BedReservation");

const getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user.id,
    }).populate("hospital", "name city");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const activeReservations =
      await BedReservation.countDocuments({
        doctor: doctor._id,
        reservationStatus: "CONFIRMED",
      });

    const capacityUsed = (
      (doctor.currentPatients /
        doctor.maxPatients) *
      100
    ).toFixed(0);

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization:
            doctor.specialization,
          status: doctor.status,
          currentPatients:
            doctor.currentPatients,
          maxPatients:
            doctor.maxPatients,
        },

        hospital: {
          id: doctor.hospital._id,
          name: doctor.hospital.name,
          city: doctor.hospital.city,
        },

        stats: {
          activeReservations,
          capacityUsed:
            `${capacityUsed}%`,
        },
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getDoctorDashboard,
};