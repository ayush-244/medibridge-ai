const Referral = require("../models/Referral");
const Hospital = require("../models/Hospital");
const BedReservation = require("../models/BedReservation");
const { findAvailableDoctor } = require("../services/doctor.service");
const getSpecialization = require("../utils/specializationMapper");
const getBedType = require(
  "../utils/bedTypeMapper"
);
const logActivity = require("../services/activityLogger.service");
const createNotification = require(
  "../services/notification.service"
);

const createReferral = async (req, res) => {
  try {
    const referral = await Referral.create(req.body);

    await logActivity({
      action: "REFERRAL_CREATED",
      entityType: "Referral",
      entityId: referral._id,
      description: `Referral created for ${referral.patientName}`,
    });

    await createNotification({
      title: "New Referral",
      message: `${referral.patientName} referral created`,
      type: "INFO",
    });

    res.status(201).json({
      success: true,
      message: "Referral created successfully",
      data: referral,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find()
      .populate("fromHospital", "name city")
      .populate("toHospital", "name city")
      .populate("requestedBy", "name email");

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const acceptReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    const hospital = await Hospital.findById(
      referral.toHospital
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Destination hospital not found",
      });
    }

    const specialization = getSpecialization(
      referral.condition
    );

    const bedType = getBedType(
      referral.condition
    );

    if (
      bedType === "ICU" &&
      hospital.availableICUBeds <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No ICU beds available",
      });
    }

    if (
      bedType === "GENERAL" &&
      hospital.availableBeds <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No beds available",
      });
    }

    const doctor = await findAvailableDoctor(
      hospital._id,
      specialization
    );

    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: `No ${specialization} doctor available`,
      });
    }

    if (bedType === "ICU") {
      hospital.availableICUBeds -= 1;
    } else {
      hospital.availableBeds -= 1;
    }

    await hospital.save();

    referral.status = "ACCEPTED";
    await referral.save();

    await logActivity({
      action: "REFERRAL_ACCEPTED",
      entityType: "Referral",
      entityId: referral._id,
      description: `Referral accepted for ${referral.patientName}`,
    });

    await createNotification({
      title: "Referral Accepted",
      message: `${referral.patientName} accepted`,
      type: "SUCCESS",
    });

    const reservation = await BedReservation.create({
      patientName: referral.patientName,
      referral: referral._id,
      hospital: hospital._id,
      doctor: doctor._id,
      bedType,
      reservationStatus: "CONFIRMED",
      expiresAt: new Date(
        Date.now() + 60 * 1000
      ),
    });

    await logActivity({
      action: "BED_RESERVED",
      entityType: "Reservation",
      entityId: reservation._id,
      description: `Bed reserved for ${referral.patientName}`,
    });

    doctor.currentPatients += 1;

if (
  doctor.currentPatients >=
  doctor.maxPatients
) {
  doctor.status = "BUSY";
}

await doctor.save();
    doctor.status = "BUSY";
    doctor.currentPatients += 1;
    await doctor.save();

    await logActivity({
      action: "DOCTOR_ASSIGNED",
      entityType: "Doctor",
      entityId: doctor._id,
      description: `${doctor.name} assigned to ${referral.patientName}`,
    });

    res.status(200).json({
      success: true,
      message:
        "Referral accepted and bed reserved",
      data: {
        referral,
        reservation,
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
          status: doctor.status,
          currentPatients: doctor.currentPatients,
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

const rejectReferral = async (req, res) => {
  try {
    const referral = await Referral.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true }
    );

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Referral rejected",
      data: referral,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const completeReferral = async (req, res) => {
  try {
    const referral = await Referral.findByIdAndUpdate(
      req.params.id,
      { status: "COMPLETED" },
      { new: true }
    );

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Referral completed",
      data: referral,
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
  createReferral,
  getAllReferrals,
  acceptReferral,
  rejectReferral,
  completeReferral,
};