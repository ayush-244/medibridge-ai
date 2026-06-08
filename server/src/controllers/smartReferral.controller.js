const Referral = require("../models/Referral");
const Hospital = require("../models/Hospital");

const getSeverity = require("../utils/severityMapper");
const getSpecialization = require("../utils/specializationMapper");
const getBedType = require("../utils/bedTypeMapper");

const Doctor = require("../models/Doctor");
const calculateDistance = require("../utils/distance");

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

module.exports = {
  createSmartReferral,
};