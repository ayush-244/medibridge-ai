const Referral = require("../models/Referral");
const Hospital = require("../models/Hospital");
const BedReservation = require("../models/BedReservation");
const { findAvailableDoctor } = require("../services/doctor.service");
const getSpecialization = require("../utils/specializationMapper");
const getBedType = require("../utils/bedTypeMapper");
const logActivity = require("../services/activityLogger.service");
const createNotification = require("../services/notification.service");
const emitEvent = require("../services/socketEmitter.service");
const { recordTimelineEvent } = require("../services/timeline.service");
const {
  acceptReferralService,
} = require("../services/referralAcceptance.service");

const createReferral = async (req, res) => {
  try {
    const referral = await Referral.create(req.body);

    const actorName =
      typeof req.user?.name === "string" ? req.user.name : "System";

    await logActivity({
      action: "REFERRAL_CREATED",
      entityType: "Referral",
      entityId: referral._id,
      description: `Referral created for ${referral.patientName}`,
    });

    await recordTimelineEvent({
      referralId: referral._id,
      eventType: "REFERRAL_CREATED",
      actorId: req.user?._id || req.user?.id,
      actorName,
      description: `Referral created for ${referral.patientName}`,
    });

    await createNotification({
      title: "New Referral",
      message: `${referral.patientName} referral created`,
      type: "INFO",
    });

    emitEvent("dashboardUpdated", {
      action: "REFERRAL_CREATED",
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

if (req.user.role === "HOSPITAL_ADMIN") {
  query.$or = [
    {
      fromHospital: req.user.hospital,
    },
    {
      toHospital: req.user.hospital,
    },
  ];
}

// Filters
if (req.query.status) {
  query.status = req.query.status;
}

if (req.query.condition) {
  query.condition = {
    $regex: req.query.condition,
    $options: "i",
  };
}

if (req.query.patientName) {
  query.patientName = {
    $regex: req.query.patientName,
    $options: "i",
  };
}

    const referrals = await Referral.find(query)
      .populate("fromHospital", "name city location logo")
      .populate("toHospital", "name city location logo")
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
    const result = await acceptReferralService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Referral accepted and bed reserved",
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

    const actorName =
      typeof req.user?.name === "string" ? req.user.name : "System";

    await recordTimelineEvent({
      referralId: referral._id,
      eventType: "REFERRAL_REJECTED",
      actorId: req.user?._id || req.user?.id,
      actorName,
      description: `Referral rejected for ${referral.patientName}`,
    });

    await logActivity({
      action: "REFERRAL_REJECTED",
      entityType: "Referral",
      entityId: referral._id,
      description: `Referral rejected for ${referral.patientName}`,
    });

    await createNotification({
      title: "Referral Rejected",
      message: `${referral.patientName} referral rejected`,
      type: "WARNING",
    });

    emitEvent("dashboardUpdated", {
      action: "REFERRAL_REJECTED",
    });

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

    const actorName =
      typeof req.user?.name === "string" ? req.user.name : "System";

    await recordTimelineEvent({
      referralId: referral._id,
      eventType: "REFERRAL_COMPLETED",
      actorId: req.user?._id || req.user?.id,
      actorName,
      description: `Referral completed for ${referral.patientName}`,
    });

    await logActivity({
      action: "REFERRAL_COMPLETED",
      entityType: "Referral",
      entityId: referral._id,
      description: `Referral completed for ${referral.patientName}`,
    });

    await createNotification({
      title: "Referral Completed",
      message: `${referral.patientName} referral completed`,
      type: "SUCCESS",
    });

    emitEvent("dashboardUpdated", {
      action: "REFERRAL_COMPLETED",
    });

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
