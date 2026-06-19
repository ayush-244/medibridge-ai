const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const logActivity = require("../services/activityLogger.service");
const emitEvent = require("../services/socketEmitter.service");
const createNotification = require("../services/notification.service");
const {
  isValidEmail,
  isValidPhone,
  isValidSpecialization,
} = require("../utils/validators");
const { TEMP_PASSWORD } = require("../utils/password");

const createDoctor = async (req, res) => {
  try {
    if (req.user.role === "HOSPITAL_ADMIN") {
      req.body.hospital = req.user.hospital;
    }

    const { name, email, specialization, experience, phone, hospital } =
      req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Doctor name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Doctor email is required",
      });
    }

    if (!specialization || !isValidSpecialization(specialization)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid specialization",
      });
    }

    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: "Hospital is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid doctor email address",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const existingDoctor = await Doctor.findOne({ email: normalizedEmail });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "A doctor with this email already exists",
      });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone number (7–15 digits)",
      });
    }

    const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "DOCTOR",
      hospital,
      phone: phone?.trim() || undefined,
      verificationStatus: "APPROVED",
      isVerified: true,
      isActive: true,
      mustChangePassword: true,
    });

    const doctor = await Doctor.create({
      name: name.trim(),
      email: normalizedEmail,
      specialization,
      experience: experience || 0,
      hospital,
      user: user._id,
      phone: phone?.trim() || undefined,
    });

    await Hospital.findByIdAndUpdate(hospital, {
      $push: { doctors: doctor._id },
    });

    await logActivity({
      action: "DOCTOR_CREATED",
      entityType: "Doctor",
      entityId: doctor._id,
      description: `Doctor ${doctor.name} created with user account`,
      performedBy: req.user?.id || "SYSTEM",
    });

    emitEvent("doctorCreated", {
      doctorId: doctor._id,
      doctorName: doctor.name,
    });

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor,
      temporaryPassword: TEMP_PASSWORD,
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

const getPendingDoctors = async (req, res) => {
  try {
    const query = {
      role: "DOCTOR",
      verificationStatus: "PENDING",
    };

    if (req.user.role === "HOSPITAL_ADMIN") {
      query.hospital = req.user.hospital;
    } else if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const users = await User.find(query)
      .select("-password")
      .populate("hospital", "name city")
      .sort({ createdAt: -1 });

    const enriched = await Promise.all(
      users.map(async (user) => {
        const doctor = await Doctor.findOne({ user: user._id });
        return {
          ...user.toObject(),
          doctorProfile: doctor,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending doctors",
    });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role !== "DOCTOR") {
      return res.status(404).json({
        success: false,
        message: "Pending doctor not found",
      });
    }

    if (user.verificationStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Doctor is not pending approval",
      });
    }

    if (
      req.user.role === "HOSPITAL_ADMIN" &&
      String(user.hospital) !== String(req.user.hospital)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    user.verificationStatus = "APPROVED";
    user.isVerified = true;
    await user.save();

    const doctor = await Doctor.findOne({ user: user._id });

    await logActivity({
      action: "DOCTOR_APPROVED",
      entityType: "Doctor",
      entityId: doctor?._id || user._id,
      description: `Doctor ${user.name} approved`,
      performedBy: req.user.id,
    });

    await createNotification({
      title: "Doctor Approved",
      message: `Dr. ${user.name} has been approved and can now sign in.`,
      type: "SUCCESS",
    });

    emitEvent("doctorApproved", {
      userId: user._id,
      doctorId: doctor?._id,
      doctorName: user.name,
    });

    emitEvent("dashboardUpdated", { action: "DOCTOR_APPROVED" });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Doctor approved successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to approve doctor",
    });
  }
};

const rejectDoctor = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role !== "DOCTOR") {
      return res.status(404).json({
        success: false,
        message: "Pending doctor not found",
      });
    }

    if (user.verificationStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Doctor is not pending approval",
      });
    }

    if (
      req.user.role === "HOSPITAL_ADMIN" &&
      String(user.hospital) !== String(req.user.hospital)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    user.verificationStatus = "REJECTED";
    user.isVerified = false;
    await user.save();

    const doctor = await Doctor.findOne({ user: user._id });

    await logActivity({
      action: "DOCTOR_REJECTED",
      entityType: "Doctor",
      entityId: doctor?._id || user._id,
      description: `Doctor ${user.name} rejected`,
      performedBy: req.user.id,
    });

    await createNotification({
      title: "Doctor Rejected",
      message: `Dr. ${user.name}'s registration request was rejected.`,
      type: "ERROR",
    });

    emitEvent("doctorRejected", {
      userId: user._id,
      doctorId: doctor?._id,
      doctorName: user.name,
    });

    emitEvent("dashboardUpdated", { action: "DOCTOR_REJECTED" });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Doctor rejected",
      data: userResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to reject doctor",
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
    if (profilePhoto !== undefined) {
      doctor.profilePhoto = profilePhoto || null;
      if (doctor.user) {
        await User.findByIdAndUpdate(doctor.user, {
          $set: { profilePhoto: null },
        });
      }
    }

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
      userId: doctor.user ? String(doctor.user) : undefined,
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
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  updateDoctor,
};
