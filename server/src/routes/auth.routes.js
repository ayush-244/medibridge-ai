const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working",
  });
});

module.exports = router;