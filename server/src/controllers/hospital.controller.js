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

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateBeds = async (req, res) => {
  try {
    const { availableBeds, availableICUBeds } = req.body;

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    if (availableBeds > hospital.totalBeds) {
      return res.status(400).json({
        success: false,
        message: "Available beds cannot exceed total beds",
      });
    }

    if (availableICUBeds > hospital.totalICUBeds) {
      return res.status(400).json({
        success: false,
        message: "Available ICU beds cannot exceed total ICU beds",
      });
    }

    hospital.availableBeds = availableBeds;
    hospital.availableICUBeds = availableICUBeds;

    await hospital.save();

    res.status(200).json({
      success: true,
      message: "Beds updated successfully",
      data: hospital,
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
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateBeds,
};