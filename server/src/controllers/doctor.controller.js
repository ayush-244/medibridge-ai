const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

// Create Doctor
const createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);

    await Hospital.findByIdAndUpdate(
      doctor.hospital,
      {
        $push: { doctors: doctor._id },
      }
    );

    res.status(201).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create doctor",
    });
  }
};

// Get All Doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate(
      "hospital",
      "name city"
    );

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

// Get Doctors By Hospital
const getDoctorsByHospital = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      hospital: req.params.hospitalId,
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorsByHospital,
};