const User = require("../models/User");

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
  { new: true }
).select("-password");

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

module.exports = {
  getPendingUsers,
  approveUser,
};