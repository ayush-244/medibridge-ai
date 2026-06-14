const Hospital = require("../models/Hospital");
const logActivity = require("../services/activityLogger.service");
const emitEvent = require("../services/socketEmitter.service");

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
      location,
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
      contactNumber: req.body.contactNumber,
      email: req.body.email,
      totalBeds,
      availableBeds,
      totalICUBeds,
      availableICUBeds,
      location,
    });

    await logActivity({
      action: "HOSPITAL_CREATED",
      entityType: "Hospital",
      entityId: hospital._id,
      description: `Hospital ${name} created`,
      performedBy: req.user?.id || "SYSTEM",
    });

    emitEvent("hospitalUpdated", {
      hospitalId: hospital._id,
      name: hospital.name,
      action: "created",
    });

    res.status(201).json({
      success: true,
      message: "Hospital created successfully",
      data: hospital,
    });
  } catch (error) {
    console.error("Hospital Creation Error:", error);

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

    await logActivity({
      action: "HOSPITAL_BEDS_UPDATED",
      entityType: "Hospital",
      entityId: hospital._id,
      description: `Bed availability updated for ${hospital.name}`,
      performedBy: req.user?.id || "SYSTEM",
    });

    emitEvent("hospitalUpdated", {
      hospitalId: hospital._id,
      name: hospital.name,
      action: "beds_updated",
    });

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

const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const {
      name,
      address,
      city,
      state,
      contactNumber,
      email,
      totalBeds,
      availableBeds,
      totalICUBeds,
      availableICUBeds,
    } = req.body;

    if (name) hospital.name = name;
    if (address) hospital.address = address;
    if (city) hospital.city = city;
    if (state) hospital.state = state;
    if (contactNumber !== undefined) hospital.contactNumber = contactNumber;
    if (email !== undefined) hospital.email = email;
    if (totalBeds !== undefined) hospital.totalBeds = totalBeds;
    if (totalICUBeds !== undefined) hospital.totalICUBeds = totalICUBeds;
    if (availableBeds !== undefined) hospital.availableBeds = availableBeds;
    if (availableICUBeds !== undefined) {
      hospital.availableICUBeds = availableICUBeds;
    }

    if (hospital.availableBeds > hospital.totalBeds) {
      return res.status(400).json({
        success: false,
        message: "Available beds cannot exceed total beds",
      });
    }

    if (hospital.availableICUBeds > hospital.totalICUBeds) {
      return res.status(400).json({
        success: false,
        message: "Available ICU beds cannot exceed total ICU beds",
      });
    }

    await hospital.save();

    await logActivity({
      action: "HOSPITAL_UPDATED",
      entityType: "Hospital",
      entityId: hospital._id,
      description: `Hospital ${hospital.name} updated`,
      performedBy: req.user?.id || "SYSTEM",
    });

    emitEvent("hospitalUpdated", {
      hospitalId: hospital._id,
      name: hospital.name,
      action: "updated",
    });

    res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
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
  updateHospital,
};