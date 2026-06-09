const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

// Create Doctor
const createDoctor = async (req, res) => {
  try {
    // Hospital Admin can only create doctors
    // for their own hospital
    if (
      req.user.role ===
      "HOSPITAL_ADMIN"
    ) {
      req.body.hospital =
        req.user.hospital;
    }

    const doctor =
      await Doctor.create(
        req.body
      );

    await Hospital.findByIdAndUpdate(
      doctor.hospital,
      {
        $push: {
          doctors:
            doctor._id,
        },
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
      message:
        "Failed to create doctor",
    });
  }
};

// Get All Doctors
const getDoctors = async (
  req,
  res
) => {
  try {
    let doctors;

    if (
      req.user.role ===
      "SUPER_ADMIN"
    ) {
      doctors =
        await Doctor.find().populate(
          "hospital",
          "name city"
        );
    } else if (
      req.user.role ===
      "HOSPITAL_ADMIN"
    ) {
      doctors =
        await Doctor.find({
          hospital:
            req.user.hospital,
        }).populate(
          "hospital",
          "name city"
        );
    } else {
      return res.status(403).json({
        success: false,
        message:
          "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch doctors",
    });
  }
};

// Get Doctors By Hospital
const getDoctorsByHospital =
  async (req, res) => {
    try {
      // Hospital Admin can only view
      // their own hospital doctors
      if (
        req.user.role ===
          "HOSPITAL_ADMIN" &&
        req.params.hospitalId !==
          String(
            req.user.hospital
          )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied",
        });
      }

      const doctors =
        await Doctor.find({
          hospital:
            req.params
              .hospitalId,
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
        message:
          "Failed to fetch doctors",
      });
    }
  };

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorsByHospital,
};