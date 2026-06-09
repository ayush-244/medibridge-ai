const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      hospital,
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, email, password",
      });
    }

    // Restrict SUPER_ADMIN registration
    if (role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message:
          "SUPER_ADMIN registration not allowed",
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists",
      });
    }

    if (
  [
    "HOSPITAL_ADMIN",
    "REFERRAL_COORDINATOR",
  ].includes(role) &&
  !hospital
) {
  return res.status(400).json({
    success: false,
    message:
      "Hospital is required for this role",
  });
}

    // Hash Password
    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    let verificationStatus =
      "PENDING";
    let isVerified = false;

    // Auto approve doctors
    if (role === "DOCTOR") {
      verificationStatus =
        "APPROVED";
      isVerified = true;
    }

    const user =
      await User.create({
        name,
        email,
        password:
          hashedPassword,
        role,
        hospital: hospital || null,
        verificationStatus,
        isVerified,
      });

    const userResponse =
      user.toObject();

    delete userResponse.password;

    res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      data: userResponse,
    });
  } catch (error) {
    console.error(
      "Registration Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const loginUser = async (
  req,
  res
) => {
  try {
    const { email, password } =
      req.body;

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    // Check approval status
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Account verification pending approval",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
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
        expiresIn:
          process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(200).json({
      success: true,
      message:
        "Login successful",
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

module.exports = {
  registerUser,
  loginUser,
};