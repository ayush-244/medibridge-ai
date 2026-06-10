const Referral = require("../models/Referral");
const Hospital = require("../models/Hospital");
const BedReservation = require("../models/BedReservation");

const { findAvailableDoctor } = require("./doctor.service");

const getSpecialization = require("../utils/specializationMapper");
const getBedType = require("../utils/bedTypeMapper");

const logActivity = require("./activityLogger.service");
const createNotification = require("./notification.service");
const emitEvent = require("./socketEmitter.service");

const acceptReferralService = async (referralId) => {
  const referral = await Referral.findById(referralId);

  if (!referral) {
    throw new Error("Referral not found");
  }

  const hospital = await Hospital.findById(
    referral.toHospital
  );

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  const specialization =
    getSpecialization(referral.condition);

  const bedType =
    getBedType(referral.condition);

  const doctor =
    await findAvailableDoctor(
      hospital._id,
      specialization
    );

  if (!doctor) {
    throw new Error(
      `No ${specialization} doctor available`
    );
  }

  if (
    bedType === "ICU" &&
    hospital.availableICUBeds <= 0
  ) {
    throw new Error(
      "No ICU beds available"
    );
  }

  if (
    bedType === "GENERAL" &&
    hospital.availableBeds <= 0
  ) {
    throw new Error(
      "No beds available"
    );
  }

  if (bedType === "ICU") {
    hospital.availableICUBeds -= 1;
  } else {
    hospital.availableBeds -= 1;
  }

  await hospital.save();

  referral.status = "ACCEPTED";
  await referral.save();

  const reservation =
    await BedReservation.create({
      patientName:
        referral.patientName,
      referral: referral._id,
      hospital: hospital._id,
      doctor: doctor._id,
      bedType,
      reservationStatus:
        "CONFIRMED",
      expiresAt: new Date(
        Date.now() + 60 * 1000
      ),
    });

  doctor.currentPatients += 1;

  if (
    doctor.currentPatients >=
    doctor.maxPatients
  ) {
    doctor.status = "BUSY";
  }

  await doctor.save();

  emitEvent("referralAccepted", {
  referralId: referral._id,
  patientName: referral.patientName,
});

emitEvent("dashboardUpdated", {
  action: "REFERRAL_ACCEPTED",
});

emitEvent("bedReserved", {
  reservationId: reservation._id,
  patientName: referral.patientName,
});

emitEvent("dashboardUpdated", {
  action: "BED_RESERVED",
});

emitEvent("doctorAssigned", {
  doctorId: doctor._id,
  doctorName: doctor.name,
});

emitEvent("dashboardUpdated", {
  action: "DOCTOR_ASSIGNED",
});

  await createNotification({
    title: "Referral Accepted",
    message: `${referral.patientName} accepted`,
    type: "SUCCESS",
  });

  await logActivity({
    action: "REFERRAL_ACCEPTED",
    entityType: "Referral",
    entityId: referral._id,
    description: `Referral accepted for ${referral.patientName}`,
  });

  return {
    referral,
    reservation,
    doctor,
    hospital,
  };
};

module.exports = {
  acceptReferralService,
};