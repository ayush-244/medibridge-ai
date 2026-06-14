const User = require("../models/User");
const Doctor = require("../models/Doctor");
const logActivity = require("../services/activityLogger.service");
const emitEvent = require("../services/socketEmitter.service");

const getUsers = async (req, res) => {
  try {
    let query = { role: { $ne: "SUPER_ADMIN" } };

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

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("hospital", "name city state");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      req.user.role === "HOSPITAL_ADMIN" &&
      String(user.hospital?._id || user.hospital) !== String(req.user.hospital)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    let doctorProfile = null;
    if (user.role === "DOCTOR") {
      doctorProfile = await Doctor.findOne({ user: user._id }).populate(
        "hospital",
        "name city",
      );
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        doctorProfile,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Cannot deactivate super admin",
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

    user.isActive = false;
    user.isVerified = false;
    user.verificationStatus = "REJECTED";
    await user.save();

    await logActivity({
      action: "USER_DEACTIVATED",
      entityType: "User",
      entityId: user._id,
      description: `User ${user.name} deactivated`,
      performedBy: req.user.id,
    });

    emitEvent("userUpdated", {
      userId: user._id,
      name: user.name,
      action: "deactivated",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate user",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  deactivateUser,
};
