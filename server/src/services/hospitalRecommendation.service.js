const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");

const recommendHospital = async (
  specialization,
  bedType
) => {
  const hospitals = await Hospital.find();

  const recommendations = [];

  for (const hospital of hospitals) {
    const doctors = await Doctor.find({
      hospital: hospital._id,
      specialization,
    });

    const availableDoctors = doctors.filter(
      (doctor) =>
        doctor.currentPatients <
        doctor.maxPatients
    );

    const bedAvailability =
      bedType === "ICU"
        ? hospital.availableICUBeds
        : hospital.availableBeds;

    if (
      availableDoctors.length === 0 ||
      bedAvailability === 0
    ) {
      continue;
    }

    const score =
      availableDoctors.length * 30 +
      bedAvailability;

    recommendations.push({
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      city: hospital.city,
      availableDoctors:
        availableDoctors.length,
      bedAvailability,
      score,
    });
  }

  recommendations.sort(
    (a, b) => b.score - a.score
  );

  return recommendations;
};

module.exports = {
  recommendHospital,
};