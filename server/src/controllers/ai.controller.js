const Hospital = require("../models/Hospital");
const calculateDistance = require("../utils/distance");

const triagePatient = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required",
      });
    }

    const symptomText = symptoms.toLowerCase();

    let severity = "LOW";
    let recommendedDepartment = "General Medicine";
    let priority = "Normal";

    if (
      symptomText.includes("chest pain") ||
      symptomText.includes("heart") ||
      symptomText.includes("cardiac")
    ) {
      severity = "HIGH";
      recommendedDepartment = "Cardiology";
      priority = "Immediate Admission";
    } else if (
      symptomText.includes("stroke") ||
      symptomText.includes("seizure") ||
      symptomText.includes("brain")
    ) {
      severity = "HIGH";
      recommendedDepartment = "Neurology";
      priority = "Immediate Admission";
    } else if (
      symptomText.includes("breathing") ||
      symptomText.includes("asthma") ||
      symptomText.includes("oxygen")
    ) {
      severity = "MEDIUM";
      recommendedDepartment = "Pulmonology";
      priority = "Urgent";
    } else if (
      symptomText.includes("fracture") ||
      symptomText.includes("bone") ||
      symptomText.includes("leg pain")
    ) {
      severity = "MEDIUM";
      recommendedDepartment = "Orthopedics";
      priority = "Urgent";
    }

    res.status(200).json({
      success: true,
      triage: {
        symptoms,
        severity,
        recommendedDepartment,
        priority,
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

const emergencyRecommendation = async (req, res) => {
  try {
    const { symptoms, latitude, longitude } = req.body;

    if (!symptoms || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Symptoms, latitude and longitude are required",
      });
    }

    const symptomText = symptoms.toLowerCase();

    let severity = "LOW";
    let recommendedDepartment = "General Medicine";
    let priority = "Normal";

    if (
      symptomText.includes("chest pain") ||
      symptomText.includes("heart") ||
      symptomText.includes("cardiac")
    ) {
      severity = "HIGH";
      recommendedDepartment = "Cardiology";
      priority = "Immediate Admission";
    } else if (
      symptomText.includes("stroke") ||
      symptomText.includes("seizure") ||
      symptomText.includes("brain")
    ) {
      severity = "HIGH";
      recommendedDepartment = "Neurology";
      priority = "Immediate Admission";
    } else if (
      symptomText.includes("breathing") ||
      symptomText.includes("asthma") ||
      symptomText.includes("oxygen")
    ) {
      severity = "MEDIUM";
      recommendedDepartment = "Pulmonology";
      priority = "Urgent";
    }

    const hospitals = await Hospital.find();

    let bestHospital = null;
    let highestScore = -1;

    hospitals.forEach((hospital) => {
      if (
        !hospital.location ||
        hospital.location.latitude == null ||
        hospital.location.longitude == null
      ) {
        return;
      }

      const distance = calculateDistance(
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

        bestHospital = {
          ...hospital.toObject(),
          distance: Number(distance.toFixed(2)),
          mapLink: `https://www.google.com/maps?q=${hospital.location.latitude},${hospital.location.longitude}`,
        };
      }
    });

    res.status(200).json({
      success: true,
      triage: {
        severity,
        recommendedDepartment,
        priority,
      },
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

module.exports = {
  triagePatient,
  emergencyRecommendation,
};