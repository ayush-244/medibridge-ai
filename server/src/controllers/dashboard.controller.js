const Hospital = require("../models/Hospital");
const Referral = require("../models/Referral");
const Doctor = require("../models/Doctor");
const BedReservation = require("../models/BedReservation");

const getDashboardStats = async (req, res) => {
  try {

    // SUPER ADMIN DASHBOARD
    if (
      req.user.role ===
      "SUPER_ADMIN"
    ) {

      const hospitals =
        await Hospital.find();

      const totalHospitals =
        hospitals.length;

      const totalBeds =
        hospitals.reduce(
          (sum, hospital) =>
            sum +
            hospital.totalBeds,
          0
        );

      const availableBeds =
        hospitals.reduce(
          (sum, hospital) =>
            sum +
            hospital.availableBeds,
          0
        );

      const totalDoctors =
        await Doctor.countDocuments();

      const activeReservations =
        await BedReservation.countDocuments(
          {
            reservationStatus:
              "CONFIRMED",
          }
        );

      const totalReferrals =
        await Referral.countDocuments();

      return res.status(200).json({
        success: true,
        role: "SUPER_ADMIN",
        data: {
          totalHospitals,
          totalDoctors,
          totalBeds,
          availableBeds,
          activeReservations,
          totalReferrals,
        },
      });
    }

    // HOSPITAL ADMIN DASHBOARD

    const hospital =
      await Hospital.findById(
        req.user.hospital
      );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message:
          "Hospital not found",
      });
    }

    const totalDoctors =
      await Doctor.countDocuments({
        hospital:
          req.user.hospital,
      });

    const availableDoctors =
      await Doctor.countDocuments({
        hospital:
          req.user.hospital,
        status:
          "AVAILABLE",
      });

    const busyDoctors =
      await Doctor.countDocuments({
        hospital:
          req.user.hospital,
        status: "BUSY",
      });

    const activeReservations =
      await BedReservation.countDocuments(
        {
          hospital:
            req.user.hospital,
          reservationStatus:
            "CONFIRMED",
        }
      );

    const totalReferrals =
      await Referral.countDocuments({
        $or: [
          {
            fromHospital:
              req.user.hospital,
          },
          {
            toHospital:
              req.user.hospital,
          },
        ],
      });

    const acceptedReferrals =
      await Referral.countDocuments(
        {
          status:
            "ACCEPTED",
          $or: [
            {
              fromHospital:
                req.user.hospital,
            },
            {
              toHospital:
                req.user.hospital,
            },
          ],
        }
      );

    const pendingReferrals =
      await Referral.countDocuments(
        {
          status:
            "PENDING",
          $or: [
            {
              fromHospital:
                req.user.hospital,
            },
            {
              toHospital:
                req.user.hospital,
            },
          ],
        }
      );

    res.status(200).json({
      success: true,
      role: "HOSPITAL_ADMIN",
      hospital:
        hospital.name,
      data: {
        totalDoctors,
        availableDoctors,
        busyDoctors,
        totalReferrals,
        acceptedReferrals,
        pendingReferrals,
        activeReservations,
        availableBeds:
          hospital.availableBeds,
        availableICUBeds:
          hospital.availableICUBeds,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};