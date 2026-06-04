const Hospital = require("../models/Hospital");

const getBestHospital = async (req, res) => {
  try {
    const hospitals = await Hospital.find();

    if (hospitals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No hospitals found",
      });
    }

    const rankedHospitals = hospitals
      .map((hospital) => ({
        ...hospital.toObject(),
        score:
          hospital.availableBeds +
          hospital.availableICUBeds * 5,
      }))
      .sort((a, b) => b.score - a.score);

    const bestHospital = rankedHospitals[0];

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

module.exports = {
  getBestHospital,
};