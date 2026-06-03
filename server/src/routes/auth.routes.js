const express = require("express");

const {
  registerUser,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerUser);
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working"
  });
});

module.exports = router;