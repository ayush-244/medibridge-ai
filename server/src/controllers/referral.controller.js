const Referral = require("../models/Referral");

const createReferral = async (req, res) => {
  try {
    const referral = await Referral.create(req.body);

    res.status(201).json({
      success: true,
      message: "Referral created successfully",
      data: referral,
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
  createReferral,
};