const Referral = require("../models/Referral");
const Hospital = require("../models/Hospital");
const BedReservation = require("../models/BedReservation");
const { findAvailableDoctor } = require("../services/doctor.service");
const getSpecialization = require("../utils/specializationMapper");
const getBedType = require("../utils/bedTypeMapper");
const logActivity = require("../services/activityLogger.service");
const createNotification = require("../services/notification.service");
const emitEvent = require("../services/socketEmitter.service");
const {acceptReferralService,} = require("../services/referralAcceptance.service");

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
    let query = {};

    if (
      req.user.role ===
      "HOSPITAL_ADMIN"
    ) {
      query = {
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
      };
    }

    const referrals =
      await Referral.find(
        query
      )
        .populate(
          "fromHospital",
          "name city"
        )
        .populate(
          "toHospital",
          "name city"
        )
        .populate(
          "requestedBy",
          "name email"
        );

    res.status(200).json({
      success: true,
      count:
        referrals.length,
      data: referrals,
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

const acceptReferral = async (
  req,
  res
) => {
  try {
    const result =
      await acceptReferralService(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Referral accepted and bed reserved",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectReferral = async (req, res) => {
  try {
    const referral = await Referral.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true },
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
      { new: true },
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
