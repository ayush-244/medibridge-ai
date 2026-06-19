const User = require("../models/User");
const Hospital = require("../models/Hospital");
const logActivity = require("../services/activityLogger.service");
const emitEvent = require("../services/socketEmitter.service");
const createNotification = require("../services/notification.service");

const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      verificationStatus: "PENDING",
    }).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: "APPROVED",
        isVerified: true,
      },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User approved",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({
      verificationStatus: "PENDING",
    }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      hospitals.map(async (hospital) => {
        const admin = await User.findOne({
          hospital: hospital._id,
          role: "HOSPITAL_ADMIN",
        }).select("-password");

        return {
          ...hospital.toObject(),
          admin,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingHospitalAdmins = async (req, res) => {
  try {
    const users = await User.find({
      role: "HOSPITAL_ADMIN",
      verificationStatus: "PENDING",
    })
      .select("-password")
      .populate("hospital", "name city state verificationStatus")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveHospital = async (req, res) => {
  try {
    const adminUser = await User.findById(req.params.userId);

    if (!adminUser || adminUser.role !== "HOSPITAL_ADMIN") {
      return res.status(404).json({
        success: false,
        message: "Hospital admin not found",
      });
    }

    const hospital = await Hospital.findById(adminUser.hospital);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Associated hospital not found",
      });
    }

    hospital.verificationStatus = "APPROVED";
    hospital.isVerified = true;
    await hospital.save();

    await logActivity({
      action: "HOSPITAL_APPROVED",
      entityType: "Hospital",
      entityId: hospital._id,
      description: `Hospital ${hospital.name} approved`,
      performedBy: req.user.id,
    });

    await createNotification({
      title: "Hospital Approved",
      message: `${hospital.name} has been approved and is now active on MediBridge.`,
      type: "SUCCESS",
    });

    emitEvent("hospitalApproved", {
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      adminUserId: adminUser._id,
    });

    emitEvent("dashboardUpdated", { action: "HOSPITAL_APPROVED" });

    res.status(200).json({
      success: true,
      message: "Hospital approved successfully",
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectHospital = async (req, res) => {
  try {
    const adminUser = await User.findById(req.params.userId);

    if (!adminUser || adminUser.role !== "HOSPITAL_ADMIN") {
      return res.status(404).json({
        success: false,
        message: "Hospital admin not found",
      });
    }

    const hospital = await Hospital.findById(adminUser.hospital);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Associated hospital not found",
      });
    }

    hospital.verificationStatus = "REJECTED";
    hospital.isVerified = false;
    await hospital.save();

    await logActivity({
      action: "HOSPITAL_REJECTED",
      entityType: "Hospital",
      entityId: hospital._id,
      description: `Hospital ${hospital.name} rejected`,
      performedBy: req.user.id,
    });

    await createNotification({
      title: "Hospital Rejected",
      message: `${hospital.name}'s registration request was rejected.`,
      type: "ERROR",
    });

    emitEvent("hospitalRejected", {
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      adminUserId: adminUser._id,
    });

    emitEvent("dashboardUpdated", { action: "HOSPITAL_REJECTED" });

    res.status(200).json({
      success: true,
      message: "Hospital rejected",
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveHospitalAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role !== "HOSPITAL_ADMIN") {
      return res.status(404).json({
        success: false,
        message: "Pending hospital admin not found",
      });
    }

    if (user.verificationStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Hospital admin is not pending approval",
      });
    }

    user.verificationStatus = "APPROVED";
    user.isVerified = true;
    await user.save();

    await logActivity({
      action: "HOSPITAL_ADMIN_APPROVED",
      entityType: "User",
      entityId: user._id,
      description: `Hospital admin ${user.name} approved`,
      performedBy: req.user.id,
    });

    await createNotification({
      title: "Hospital Admin Approved",
      message: `${user.name} has been approved and can now sign in.`,
      type: "SUCCESS",
    });

    emitEvent("hospitalAdminApproved", {
      userId: user._id,
      name: user.name,
      hospitalId: user.hospital,
    });

    emitEvent("dashboardUpdated", { action: "HOSPITAL_ADMIN_APPROVED" });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Hospital admin approved successfully",
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectHospitalAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role !== "HOSPITAL_ADMIN") {
      return res.status(404).json({
        success: false,
        message: "Pending hospital admin not found",
      });
    }

    if (user.verificationStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Hospital admin is not pending approval",
      });
    }

    user.verificationStatus = "REJECTED";
    user.isVerified = false;
    await user.save();

    await logActivity({
      action: "HOSPITAL_ADMIN_REJECTED",
      entityType: "User",
      entityId: user._id,
      description: `Hospital admin ${user.name} rejected`,
      performedBy: req.user.id,
    });

    await createNotification({
      title: "Hospital Admin Rejected",
      message: `${user.name}'s hospital admin registration was rejected.`,
      type: "ERROR",
    });

    emitEvent("hospitalAdminRejected", {
      userId: user._id,
      name: user.name,
      hospitalId: user.hospital,
    });

    emitEvent("dashboardUpdated", { action: "HOSPITAL_ADMIN_REJECTED" });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Hospital admin rejected",
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPendingUsers,
  approveUser,
  getPendingHospitals,
  getPendingHospitalAdmins,
  approveHospital,
  rejectHospital,
  approveHospitalAdmin,
  rejectHospitalAdmin,
};
