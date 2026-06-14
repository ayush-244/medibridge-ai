const Doctor = require("../models/Doctor");
const BedReservation = require("../models/BedReservation");

const getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user.id,
    }).populate("hospital", "name city logo");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const reservations = await BedReservation.find({
      doctor: doctor._id,
    })
      .populate(
        "referral",
        "patientName age condition status createdAt updatedAt fromHospital toHospital",
      )
      .populate("hospital", "name city")
      .sort({ createdAt: -1 });

    const activeReservations = reservations.filter((reservation) =>
      ["CONFIRMED", "ARRIVED"].includes(reservation.reservationStatus),
    ).length;

    const capacityUsed =
      doctor.maxPatients > 0
        ? Math.round((doctor.currentPatients / doctor.maxPatients) * 100)
        : 0;

    const assignedReferrals = reservations
      .map((reservation) => reservation.referral)
      .filter(Boolean);

    const activeCases = reservations.filter(
      (reservation) =>
        ["CONFIRMED", "ARRIVED"].includes(reservation.reservationStatus) &&
        reservation.referral &&
        reservation.referral.status !== "COMPLETED" &&
        reservation.referral.status !== "REJECTED",
    );

    const completedCases = reservations.filter(
      (reservation) =>
        reservation.reservationStatus === "COMPLETED" ||
        (reservation.referral && reservation.referral.status === "COMPLETED"),
    );

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
          status: doctor.status,
          currentPatients: doctor.currentPatients,
          maxPatients: doctor.maxPatients,
          profilePhoto: doctor.profilePhoto,
        },
        hospital: {
          id: doctor.hospital._id,
          name: doctor.hospital.name,
          city: doctor.hospital.city,
          logo: doctor.hospital.logo,
        },
        stats: {
          activeReservations,
          capacityUsed: `${capacityUsed}%`,
          assignedReferralCount: assignedReferrals.length,
          activeCaseCount: activeCases.length,
          completedCaseCount: completedCases.length,
        },
        assignedReferrals,
        activeCases,
        completedCases,
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
