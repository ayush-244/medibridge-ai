const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const logActivity = require("../services/activityLogger.service");
const emitEvent = require("../services/socketEmitter.service");
const {
  isValidEmail,
  isValidPhone,
  isValidSpecialization,
} = require("../utils/validators");

const createDoctor = async (req, res) => {
  try {
    if (req.user.role === "HOSPITAL_ADMIN") {
      req.body.hospital = req.user.hospital;
    }

    const { email, specialization, phone } = req.body;

    if (!specialization || !isValidSpecialization(specialization)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid specialization",
      });
    }

    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid doctor email address",
        });
      }

      const existingDoctor = await Doctor.findOne({
        email: email.trim().toLowerCase(),
      });

      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: "A doctor with this email already exists",
        });
      }
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone number (7–15 digits)",
      });
    }

    const doctor = await Doctor.create(req.body);

    await Hospital.findByIdAndUpdate(doctor.hospital, {
      $push: { doctors: doctor._id },
    });

    await logActivity({
      action: "DOCTOR_CREATED",
      entityType: "Doctor",
      entityId: doctor._id,
      description: `Doctor ${doctor.name} created`,
      performedBy: req.user?.id || "SYSTEM",
    });

    emitEvent("doctorCreated", {
      doctorId: doctor._id,
      doctorName: doctor.name,
    });

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

const getDoctors = async (req, res) => {
  try {
    let doctors;

    if (req.user.role === "SUPER_ADMIN") {
      doctors = await Doctor.find().populate("hospital", "name city");
    } else if (req.user.role === "HOSPITAL_ADMIN") {
      doctors = await Doctor.find({
        hospital: req.user.hospital,
      }).populate("hospital", "name city");
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
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
      message: "Failed to fetch doctors",
    });
  }
};

const getDoctorsByHospital = async (req, res) => {
  try {
    if (
      req.user.role === "HOSPITAL_ADMIN" &&
      req.params.hospitalId !== String(req.user.hospital)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const doctors = await Doctor.find({
      hospital: req.params.hospitalId,
    }).populate("hospital", "name city");

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

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (
      req.user.role === "HOSPITAL_ADMIN" &&
      String(doctor.hospital) !== String(req.user.hospital)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const {
      name,
      email,
      specialization,
      experience,
      hospital,
      status,
      profilePhoto,
      phone,
    } = req.body;

    if (name) doctor.name = name;

    if (email !== undefined) {
      if (email) {
        if (!isValidEmail(email)) {
          return res.status(400).json({
            success: false,
            message: "Enter a valid doctor email address",
          });
        }

        const duplicate = await Doctor.findOne({
          email: email.trim().toLowerCase(),
          _id: { $ne: doctor._id },
        });

        if (duplicate) {
          return res.status(400).json({
            success: false,
            message: "A doctor with this email already exists",
          });
        }
      }

      doctor.email = email;
    }

    if (phone !== undefined) {
      if (phone && !isValidPhone(phone)) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid phone number (7–15 digits)",
        });
      }
      doctor.phone = phone;
    }

    if (specialization) {
      if (!isValidSpecialization(specialization)) {
        return res.status(400).json({
          success: false,
          message: "Select a valid specialization",
        });
      }
      doctor.specialization = specialization;
    }
    if (experience !== undefined) doctor.experience = experience;
    if (status) doctor.status = status;
    if (profilePhoto !== undefined) doctor.profilePhoto = profilePhoto || null;

    if (hospital && req.user.role === "SUPER_ADMIN") {
      const oldHospitalId = doctor.hospital;
      doctor.hospital = hospital;

      await Hospital.findByIdAndUpdate(oldHospitalId, {
        $pull: { doctors: doctor._id },
      });
      await Hospital.findByIdAndUpdate(hospital, {
        $push: { doctors: doctor._id },
      });
    }

    await doctor.save();

    await logActivity({
      action: "DOCTOR_UPDATED",
      entityType: "Doctor",
      entityId: doctor._id,
      description: `Doctor ${doctor.name} updated`,
      performedBy: req.user?.id || "SYSTEM",
    });

    emitEvent("doctorUpdated", {
      doctorId: doctor._id,
      doctorName: doctor.name,
    });

    const populated = await Doctor.findById(doctor._id).populate(
      "hospital",
      "name city",
    );

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
    });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorsByHospital,
  updateDoctor,
};
