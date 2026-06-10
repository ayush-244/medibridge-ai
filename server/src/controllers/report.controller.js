const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Referral = require("../models/Referral");
const BedReservation = require("../models/BedReservation");
const User = require("../models/User");

const getSystemSummary = async (
  req,
  res
) => {
  try {
    const totalHospitals =
      await Hospital.countDocuments();

    const totalDoctors =
      await Doctor.countDocuments();

    const availableDoctors =
      await Doctor.countDocuments({
        status: "AVAILABLE",
      });

    const busyDoctors =
      await Doctor.countDocuments({
        status: "BUSY",
      });

    const totalReferrals =
      await Referral.countDocuments();

    const acceptedReferrals =
      await Referral.countDocuments({
        status: "ACCEPTED",
      });

    const completedReferrals =
      await Referral.countDocuments({
        status: "COMPLETED",
      });

    const activeReservations =
      await BedReservation.countDocuments({
        reservationStatus:
          "CONFIRMED",
      });

    const pendingUsers =
      await User.countDocuments({
        verificationStatus:
          "PENDING",
      });

    res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        totalDoctors,
        availableDoctors,
        busyDoctors,
        totalReferrals,
        acceptedReferrals,
        completedReferrals,
        activeReservations,
        pendingUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSystemSummary,
};