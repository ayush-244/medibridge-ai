const Hospital = require("../models/Hospital");

const createHospital = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      totalBeds,
      availableBeds,
      totalICUBeds,
      availableICUBeds,
    } = req.body;

    // Validation
    if (availableBeds > totalBeds) {
      return res.status(400).json({
        success: false,
        message: "Available beds cannot exceed total beds",
      });
    }

    if (availableICUBeds > totalICUBeds) {
      return res.status(400).json({
        success: false,
        message: "Available ICU beds cannot exceed total ICU beds",
      });
    }

    const hospital = await Hospital.create({
      name,
      address,
      city,
      state,
      totalBeds,
      availableBeds,
      totalICUBeds,
      availableICUBeds,
    });

    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      data: hospital,
    });
  } catch (error) {
    console.error("Hospital Creation Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createHospital,
};