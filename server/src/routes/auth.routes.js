const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/auth.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Route
router.get(
  "/profile",
  authenticateUser,
  (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);

// Admin Only Route
router.get(
  "/admin",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Super Admin",
    });
  }
);

// Test Route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working",
  });
});

module.exports = router;