const express = require("express");

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  updateNotificationPreferences,
} = require("../controllers/auth.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorize.middleware");

const router = express.Router();

router.post("/register", authenticateUser, registerUser);
router.post("/login", loginUser);

router.get("/profile", authenticateUser, getProfile);
router.patch("/profile", authenticateUser, updateProfile);
router.patch("/password", authenticateUser, changePassword);
router.patch(
  "/notification-preferences",
  authenticateUser,
  updateNotificationPreferences,
);

router.get(
  "/admin",
  authenticateUser,
  authorizeRoles("SUPER_ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Super Admin",
    });
  },
);

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working",
  });
});

module.exports = router;
