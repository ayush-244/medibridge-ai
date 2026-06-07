const Doctor = require("../models/Doctor");

const findAvailableDoctor = async (
  hospitalId,
  specialization
) => {
  const doctors = await Doctor.find({
    hospital: hospitalId,
    specialization,
    status: {
      $ne: "OFF_DUTY",
    },
  }).sort({
    currentPatients: 1,
  });

  return doctors.find(
    (doctor) =>
      doctor.currentPatients <
      doctor.maxPatients
  );
};

module.exports = {
  findAvailableDoctor,
};