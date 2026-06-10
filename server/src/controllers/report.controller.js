const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Referral = require("../models/Referral");
const BedReservation = require("../models/BedReservation");
const User = require("../models/User");

const getHospitalSummary = async (
  req,
  res
) => {
  try {
    const hospitals =
      await Hospital.find();

    const totalHospitals =
      hospitals.length;

    const totalBeds =
      hospitals.reduce(
        (sum, hospital) =>
          sum + hospital.totalBeds,
        0
      );

    const availableBeds =
      hospitals.reduce(
        (sum, hospital) =>
          sum +
          hospital.availableBeds,
        0
      );

    const totalICUBeds =
      hospitals.reduce(
        (sum, hospital) =>
          sum +
          hospital.totalICUBeds,
        0
      );

    const availableICUBeds =
      hospitals.reduce(
        (sum, hospital) =>
          sum +
          hospital.availableICUBeds,
        0
      );

    res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        totalBeds,
        availableBeds,
        totalICUBeds,
        availableICUBeds,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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

const getReferralSummary = async (
  req,
  res
) => {
  try {
    const totalReferrals =
      await Referral.countDocuments();

    const accepted =
      await Referral.countDocuments({
        status: "ACCEPTED",
      });

    const pending =
      await Referral.countDocuments({
        status: "PENDING",
      });

    const rejected =
      await Referral.countDocuments({
        status: "REJECTED",
      });

    const completed =
      await Referral.countDocuments({
        status: "COMPLETED",
      });

    const acceptanceRate =
      totalReferrals > 0
        ? (
            (accepted /
              totalReferrals) *
            100
          ).toFixed(2) + "%"
        : "0%";

    res.status(200).json({
      success: true,
      data: {
        totalReferrals,
        accepted,
        pending,
        rejected,
        completed,
        acceptanceRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDoctorSummary = async (
  req,
  res
) => {
  try {
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

    const offDutyDoctors =
      await Doctor.countDocuments({
        status: "OFF_DUTY",
      });

    const doctors =
      await Doctor.find();

    const totalLoad =
      doctors.reduce(
        (sum, doctor) =>
          sum +
          doctor.currentPatients,
        0
      );

    const averageLoad =
      totalDoctors > 0
        ? (
            totalLoad /
            totalDoctors
          ).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        availableDoctors,
        busyDoctors,
        offDutyDoctors,
        averageLoad,
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
  getHospitalSummary,
  getDoctorSummary,
  getReferralSummary,
};