const Referral = require("../models/Referral");
const Hospital = require("../models/Hospital");

const getSeverity = require("../utils/severityMapper");
const getSpecialization = require("../utils/specializationMapper");
const getBedType = require("../utils/bedTypeMapper");

const Doctor = require("../models/Doctor");
const calculateDistance = require("../utils/distance");
const {acceptReferralService,} = require("../services/referralAcceptance.service");
const { recordTimelineEvent } = require("../services/timeline.service");

const createSmartReferral = async (req, res) => {
  try {
    const {
      patientName,
      age,
      condition,
      latitude,
      longitude,
      fromHospital,
      requestedBy,
    } = req.body;

    const severity =
      getSeverity(condition);

    const specialization =
      getSpecialization(condition);

    const bedType =
      getBedType(condition);

    const hospitals =
      await Hospital.find();

    let bestHospital = null;
    let highestScore = -1;

    for (const hospital of hospitals) {
      if (
        !hospital.location ||
        hospital.location.latitude == null ||
        hospital.location.longitude == null
      ) {
        continue;
      }

      const distance =
        calculateDistance(
          Number(latitude),
          Number(longitude),
          hospital.location.latitude,
          hospital.location.longitude
        );

      const doctors =
        await Doctor.find({
          hospital: hospital._id,
          specialization,
        });

      const availableDoctors =
        doctors.filter(
          (doctor) =>
            doctor.currentPatients <
            doctor.maxPatients
        );

      const bedScore =
        bedType === "ICU"
          ? hospital.availableICUBeds
          : hospital.availableBeds;

      const doctorScore =
        availableDoctors.length * 50;

      const score =
        bedScore +
        doctorScore -
        distance;

      if (score > highestScore) {
        highestScore = score;
        bestHospital = hospital;
      }
    }

    if (!bestHospital) {
      return res.status(404).json({
        success: false,
        message:
          "No suitable hospital found",
      });
    }

    const referral =
      await Referral.create({
        patientName,
        age,
        condition,
        fromHospital,
        toHospital:
          bestHospital._id,
        requestedBy,
      });

    await recordTimelineEvent({
      referralId: referral._id,
      eventType: "REFERRAL_CREATED",
      description: `AI-optimized referral created for ${patientName} → ${bestHospital.name}`,
      metadata: { smartMatch: true, hospitalName: bestHospital.name, severity, specialization, bedType },
    });

    res.status(201).json({
      success: true,
      severity,
      specialization,
      bedType,
      recommendedHospital:
        bestHospital.name,
      referral,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const createEmergencyReferral = async (req, res) => {
  try {
    const {
      patientName,
      age,
      condition,
      latitude,
      longitude,
      fromHospital,
      requestedBy,
    } = req.body;

    const severity = getSeverity(condition);

    const specialization =
      getSpecialization(condition);

    const bedType =
      getBedType(condition);

    const hospitals =
      await Hospital.find();

    let bestHospital = null;
    let highestScore = -1;

    for (const hospital of hospitals) {
      if (
        !hospital.location ||
        hospital.location.latitude == null ||
        hospital.location.longitude == null
      ) {
        continue;
      }

      const distance =
        calculateDistance(
          Number(latitude),
          Number(longitude),
          hospital.location.latitude,
          hospital.location.longitude
        );

      const score =
        hospital.availableBeds +
        hospital.availableICUBeds * 5 -
        distance;

      if (score > highestScore) {
        highestScore = score;
        bestHospital = hospital;
      }
    }

    const referral =
      await Referral.create({
        patientName,
        age,
        condition,
        fromHospital,
        toHospital:
          bestHospital._id,
        requestedBy,
      });

    const result =
      await acceptReferralService(
        referral._id
      );

    res.status(201).json({
      success: true,
      emergency: true,
      severity,
      specialization,
      bedType,
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSmartReferral,
  createEmergencyReferral,
};