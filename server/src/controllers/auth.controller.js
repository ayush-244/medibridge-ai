const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logActivity = require("../services/activityLogger.service");
const emitEvent = require("../services/socketEmitter.service");
const {
  isValidEmail,
  isValidPhone,
  isValidSpecialization,
} = require("../utils/validators");

const registerUser = async (req, res) => {
  try {
    if (
      req.user &&
      !["SUPER_ADMIN", "HOSPITAL_ADMIN"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const {
      name,
      email,
      password,
      role,
      hospital,
      specialization,
      experience,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, password",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "SUPER_ADMIN registration not allowed",
      });
    }

    let assignedHospital = hospital;

    if (req.user?.role === "HOSPITAL_ADMIN") {
      assignedHospital = req.user.hospital;
      if (role === "HOSPITAL_ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Hospital admins cannot create other hospital admins",
        });
      }
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    if (
      ["HOSPITAL_ADMIN", "REFERRAL_COORDINATOR", "DOCTOR"].includes(role) &&
      !assignedHospital
    ) {
      return res.status(400).json({
        success: false,
        message: "Hospital is required for this role",
      });
    }

    if (role === "DOCTOR" && !specialization) {
      return res.status(400).json({
        success: false,
        message: "Specialization is required for doctors",
      });
    }

    if (role === "DOCTOR" && !isValidSpecialization(specialization)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid specialization",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let verificationStatus = "PENDING";
    let isVerified = false;

    if (role === "DOCTOR") {
      verificationStatus = "APPROVED";
      isVerified = true;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      hospital: assignedHospital || null,
      verificationStatus,
      isVerified,
      isActive: true,
    });

    if (role === "DOCTOR") {
      const doctor = await Doctor.create({
        name,
        email,
        specialization,
        experience: experience || 0,
        hospital: assignedHospital,
        user: user._id,
      });

      await Hospital.findByIdAndUpdate(hospital, {
        $push: { doctors: doctor._id },
      });

      emitEvent("doctorCreated", {
        doctorId: doctor._id,
        doctorName: doctor.name,
      });
    }

    await logActivity({
      action: "USER_CREATED",
      entityType: "User",
      entityId: user._id,
      description: `User ${name} created with role ${role}`,
      performedBy: req.user?.id || "SYSTEM",
    });

    emitEvent("userCreated", {
      userId: user._id,
      name: user.name,
      role: user.role,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error("Registration Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account verification pending approval",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        hospital: user.hospital,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("hospital", "name city");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        role: user.role,
        hospital: user.hospital?._id || user.hospital,
        hospitalName: user.hospital?.name,
        notificationPreferences: user.notificationPreferences,
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

const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePhoto } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto || null;
    }

    await user.save();

    emitEvent("userUpdated", {
      userId: user._id,
      name: user.name,
      action: "profile_updated",
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        role: user.role,
        hospital: user.hospital,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const prefs = req.body;
    const allowedKeys = [
      "referralAccepted",
      "doctorAssigned",
      "bedReserved",
      "reservationExpired",
    ];

    for (const key of allowedKeys) {
      if (typeof prefs[key] === "boolean") {
        user.notificationPreferences[key] = prefs[key];
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Notification preferences updated",
      data: user.notificationPreferences,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
};
