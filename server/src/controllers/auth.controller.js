const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logActivity = require("../services/activityLogger.service");
const emitEvent = require("../services/socketEmitter.service");
const createNotification = require("../services/notification.service");
const {
  isValidEmail,
  isValidPhone,
  isValidSpecialization,
} = require("../utils/validators");
const {
  TEMP_PASSWORD,
  isValidPassword,
  getPasswordValidationMessage,
} = require("../utils/password");

const validateLocation = (location) => {
  if (
    !location ||
    location.latitude == null ||
    location.longitude == null
  ) {
    return "Latitude and longitude are required";
  }

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    return "Latitude must be a number between -90 and 90";
  }

  if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    return "Longitude must be a number between -180 and 180";
  }

  return null;
};

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  hospital: user.hospital?._id || user.hospital,
  hospitalName: user.hospital?.name,
  verificationStatus: user.verificationStatus,
  isVerified: user.isVerified,
  mustChangePassword: user.mustChangePassword,
});

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
      role,
      hospital,
      specialization,
      experience,
      phone,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
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

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

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

    if (role === "DOCTOR") {
      if (!specialization) {
        return res.status(400).json({
          success: false,
          message: "Specialization is required for doctors",
        });
      }

      if (!isValidSpecialization(specialization)) {
        return res.status(400).json({
          success: false,
          message: "Select a valid specialization",
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

    const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);

    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      hospital: assignedHospital || null,
      phone: phone || undefined,
      verificationStatus: "APPROVED",
      isVerified: true,
      isActive: true,
      mustChangePassword: true,
    });

    if (role === "DOCTOR") {
      const doctor = await Doctor.create({
        name,
        email: email.trim().toLowerCase(),
        specialization,
        experience: experience || 0,
        hospital: assignedHospital,
        user: user._id,
        phone: phone || undefined,
      });

      await Hospital.findByIdAndUpdate(assignedHospital, {
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
      temporaryPassword: TEMP_PASSWORD,
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

const registerHospital = async (req, res) => {
  try {
    const {
      hospitalName,
      address,
      city,
      state,
      phone,
      adminName,
      adminEmail,
      password,
      location,
    } = req.body;

    if (
      !hospitalName?.trim() ||
      !address?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !phone?.trim() ||
      !adminName?.trim() ||
      !adminEmail?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!isValidEmail(adminEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid admin email address",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone number (7–15 digits)",
      });
    }

    const passwordError = getPasswordValidationMessage(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    const locationError = validateLocation(location);
    if (locationError) {
      return res.status(400).json({
        success: false,
        message: locationError,
      });
    }

    const existingUser = await User.findOne({
      email: adminEmail.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const existingHospital = await Hospital.findOne({
      name: { $regex: new RegExp(`^${hospitalName.trim()}$`, "i") },
    });

    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: "A hospital with this name already exists",
      });
    }

    const hospital = await Hospital.create({
      name: hospitalName.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      contactNumber: phone.trim(),
      totalBeds: 0,
      availableBeds: 0,
      totalICUBeds: 0,
      availableICUBeds: 0,
      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      },
      verificationStatus: "PENDING",
      isVerified: false,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      name: adminName.trim(),
      email: adminEmail.trim().toLowerCase(),
      password: hashedPassword,
      role: "HOSPITAL_ADMIN",
      hospital: hospital._id,
      phone: phone.trim(),
      verificationStatus: "PENDING",
      isVerified: false,
      isActive: true,
      mustChangePassword: false,
    });

    await logActivity({
      action: "HOSPITAL_REGISTERED",
      entityType: "Hospital",
      entityId: hospital._id,
      description: `Hospital ${hospital.name} registered by ${adminName}`,
      performedBy: String(adminUser._id),
    });

    await createNotification({
      title: "Hospital Registration Submitted",
      message: `${hospital.name} has submitted a registration request and is awaiting approval.`,
      type: "INFO",
    });

    emitEvent("hospitalRegistered", {
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      adminUserId: adminUser._id,
    });

    emitEvent("dashboardUpdated", { action: "HOSPITAL_REGISTERED" });

    res.status(201).json({
      success: true,
      message:
        "Hospital registration submitted successfully. Awaiting super admin approval.",
      data: {
        hospitalId: hospital._id,
        adminUserId: adminUser._id,
      },
    });
  } catch (error) {
    console.error("Hospital Registration Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      experience,
      hospitalId,
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !specialization ||
      !hospitalId
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, specialization, and hospital are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    const passwordError = getPasswordValidationMessage(password);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    if (!isValidSpecialization(specialization)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid specialization",
      });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone number (7–15 digits)",
      });
    }

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    if (
      hospital.verificationStatus &&
      hospital.verificationStatus !== "APPROVED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected hospital is not available for registration",
      });
    }

    if (hospital.isVerified === false) {
      return res.status(400).json({
        success: false,
        message: "Selected hospital is not available for registration",
      });
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "DOCTOR",
      hospital: hospitalId,
      phone: phone?.trim() || undefined,
      verificationStatus: "PENDING",
      isVerified: false,
      isActive: true,
      mustChangePassword: false,
    });

    const doctor = await Doctor.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      specialization,
      experience: experience || 0,
      hospital: hospitalId,
      user: user._id,
      phone: phone?.trim() || undefined,
    });

    await Hospital.findByIdAndUpdate(hospitalId, {
      $push: { doctors: doctor._id },
    });

    await logActivity({
      action: "DOCTOR_REGISTERED",
      entityType: "Doctor",
      entityId: doctor._id,
      description: `Doctor ${name} registered at ${hospital.name}`,
      performedBy: String(user._id),
    });

    await createNotification({
      title: "Doctor Registration Submitted",
      message: `Dr. ${name} has submitted a registration request for ${hospital.name}.`,
      type: "INFO",
    });

    emitEvent("doctorRegistered", {
      doctorId: doctor._id,
      doctorName: doctor.name,
      hospitalId: hospital._id,
      userId: user._id,
    });

    emitEvent("dashboardUpdated", { action: "DOCTOR_REGISTERED" });

    res.status(201).json({
      success: true,
      message:
        "Doctor registration submitted successfully. Awaiting hospital admin approval.",
      data: {
        userId: user._id,
        doctorId: doctor._id,
      },
    });
  } catch (error) {
    console.error("Doctor Registration Error:", error.message);

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

    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .populate("hospital", "name");

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

    if (!user.isVerified || user.verificationStatus === "PENDING") {
      return res.status(403).json({
        success: false,
        message: "Account verification pending approval",
        verificationStatus: user.verificationStatus,
        pendingApproval: true,
      });
    }

    if (user.verificationStatus === "REJECTED") {
      return res.status(403).json({
        success: false,
        message: "Account registration was rejected",
        verificationStatus: "REJECTED",
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
        hospital: user.hospital?._id || user.hospital,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    const userResponse = buildUserResponse(user);

    if (user.mustChangePassword) {
      await createNotification({
        title: "First Login Password Change Required",
        message: `${user.name}, please change your temporary password before accessing the platform.`,
        type: "WARNING",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
      mustChangePassword: user.mustChangePassword,
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

    let profilePhoto = user.profilePhoto;

    if (user.role === "DOCTOR") {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        const legacyUserPhoto = user.profilePhoto;

        if (!doctor.profilePhoto && legacyUserPhoto) {
          doctor.profilePhoto = user.profilePhoto;
          await doctor.save();
        }

        if (legacyUserPhoto) {
          user.profilePhoto = null;
          await user.save();
        }

        profilePhoto = doctor.profilePhoto;
      }
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto,
        role: user.role,
        hospital: user.hospital?._id || user.hospital,
        hospitalName: user.hospital?.name,
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified,
        mustChangePassword: user.mustChangePassword,
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
    let effectiveProfilePhoto = user.profilePhoto;
    let doctorProfile = null;

    if (user.role === "DOCTOR") {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    if (profilePhoto !== undefined && doctorProfile) {
      doctorProfile.profilePhoto = profilePhoto || null;
      await doctorProfile.save();
      user.profilePhoto = null;
      effectiveProfilePhoto = doctorProfile.profilePhoto;
    } else if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto || null;
      effectiveProfilePhoto = user.profilePhoto;
    } else if (doctorProfile) {
      effectiveProfilePhoto = doctorProfile.profilePhoto;
    }

    await user.save();

    emitEvent("userUpdated", {
      userId: user._id,
      name: user.name,
      action: "profile_updated",
    });

    if (doctorProfile && profilePhoto !== undefined) {
      emitEvent("doctorUpdated", {
        doctorId: doctorProfile._id,
        doctorName: doctorProfile.name,
        userId: String(user._id),
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: effectiveProfilePhoto,
        role: user.role,
        hospital: user.hospital,
        mustChangePassword: user.mustChangePassword,
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

    const passwordError = getPasswordValidationMessage(newPassword);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
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

    const wasForcedChange = user.mustChangePassword;

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    const activityAction = wasForcedChange
      ? "FIRST_LOGIN_PASSWORD_CHANGED"
      : "PASSWORD_CHANGED";

    await logActivity({
      action: activityAction,
      entityType: "User",
      entityId: user._id,
      description: `Password changed for ${user.name}`,
      performedBy: String(user._id),
    });

    await createNotification({
      title: "Password Changed",
      message: `Your password was successfully changed.`,
      type: "SUCCESS",
    });

    emitEvent("passwordChanged", {
      userId: user._id,
      name: user.name,
      firstLogin: wasForcedChange,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      mustChangePassword: false,
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
  registerHospital,
  registerDoctor,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
};
