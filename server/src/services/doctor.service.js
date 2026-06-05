const Doctor = require("../models/Doctor");

const findAvailableDoctor = async (
  hospitalId,
  specialization
) => {
  return await Doctor.findOne({
    hospital: hospitalId,
    specialization,
    status: "AVAILABLE",
  }).sort({
    currentPatients: 1,
  });
};

module.exports = {
  findAvailableDoctor,
};