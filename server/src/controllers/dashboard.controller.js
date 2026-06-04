const Hospital = require("../models/Hospital");
const Referral = require("../models/Referral");

const getDashboardStats = async (req, res) => {
  try {
    const hospitals = await Hospital.find();

    const totalHospitals = hospitals.length;

    const totalBeds = hospitals.reduce(
      (sum, hospital) => sum + hospital.totalBeds,
      0
    );

    const availableBeds = hospitals.reduce(
      (sum, hospital) => sum + hospital.availableBeds,
      0
    );

    const totalICUBeds = hospitals.reduce(
      (sum, hospital) => sum + hospital.totalICUBeds,
      0
    );

    const availableICUBeds = hospitals.reduce(
      (sum, hospital) => sum + hospital.availableICUBeds,
      0
    );

    const pendingReferrals = await Referral.countDocuments({
      status: "PENDING",
    });

    const acceptedReferrals = await Referral.countDocuments({
      status: "ACCEPTED",
    });

    const completedReferrals = await Referral.countDocuments({
      status: "COMPLETED",
    });

    res.status(200).json({
      success: true,
      stats: {
        totalHospitals,
        totalBeds,
        availableBeds,
        totalICUBeds,
        availableICUBeds,
        pendingReferrals,
        acceptedReferrals,
        completedReferrals,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getDashboardStats,
};