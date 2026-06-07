const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const calculateDistance = require("../utils/distance");

const getBestHospital = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      specialization,
      bedType,
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required",
      });
    }

    const hospitals = await Hospital.find();

    if (!hospitals.length) {
      return res.status(404).json({
        success: false,
        message: "No hospitals found",
      });
    }

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

      const distance = calculateDistance(
        Number(latitude),
        Number(longitude),
        hospital.location.latitude,
        hospital.location.longitude
      );

      const doctors = await Doctor.find({
        hospital: hospital._id,
        specialization,
      });

      const availableDoctors = doctors.filter(
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

        bestHospital = {
          ...hospital.toObject(),

          distance: distance.toFixed(2),

          score: score.toFixed(2),

          availableDoctors:
            availableDoctors.length,

          specialization,

          bedType,

          mapLink: `https://www.google.com/maps?q=${hospital.location.latitude},${hospital.location.longitude}`,
        };
      }
    }

    res.status(200).json({
      success: true,
      recommendedHospital: bestHospital,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getNearbyHospitals = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    const hospitals = await Hospital.find();

    const result = hospitals
      .filter(
        (hospital) =>
          hospital.location &&
          hospital.location.latitude != null &&
          hospital.location.longitude != null
      )
      .map((hospital) => ({
        ...hospital.toObject(),

        distance: Number(
          calculateDistance(
            Number(latitude),
            Number(longitude),
            hospital.location.latitude,
            hospital.location.longitude
          ).toFixed(2)
        ),

        mapLink: `https://www.google.com/maps?q=${hospital.location.latitude},${hospital.location.longitude}`,
      }))
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: result.length,
      hospitals: result,
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
  getBestHospital,
  getNearbyHospitals,
};