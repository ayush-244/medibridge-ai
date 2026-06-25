const Referral = require("../models/Referral");
const Hospital = require("../models/Hospital");
const BedReservation = require("../models/BedReservation");
const Doctor = require("../models/Doctor");

const { findAvailableDoctor } = require("./doctor.service");

const getSpecialization = require("../utils/specializationMapper");
const getBedType = require("../utils/bedTypeMapper");

const logActivity = require("./activityLogger.service");
const createNotification = require("./notification.service");
const emitEvent = require("./socketEmitter.service");
const { recordTimelineEvent } = require("./timeline.service");

const acceptReferralService = async (referralId, options = {}) => {
  const { doctorId: preferredDoctorId, bedType: preferredBedType } = options;

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

  let doctor;

  if (preferredDoctorId) {
    doctor = await Doctor.findById(preferredDoctorId);

    if (!doctor) {
      throw new Error("Selected doctor not found");
    }

    if (doctor.hospital.toString() !== hospital._id.toString()) {
      throw new Error("Selected doctor is not at the receiving hospital");
    }

    if (doctor.status === "OFF_DUTY") {
      throw new Error("Selected doctor is off duty");
    }

    if (doctor.currentPatients >= doctor.maxPatients) {
      throw new Error("Selected doctor has no available capacity");
    }
  } else {
    doctor =
      await findAvailableDoctor(
        hospital._id,
        specialization
      );

    if (!doctor) {
      throw new Error(
        `No ${specialization} doctor available`
      );
    }
  }

  const bedType =
    preferredBedType || getBedType(referral.condition);

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
        Date.now() + 6 * 60 * 60 * 1000
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

  await recordTimelineEvent({
    referralId: referral._id,
    eventType: "REFERRAL_ACCEPTED",
    description: `Referral accepted — ${referral.patientName} assigned to ${doctor.name} (${specialization})`,
    metadata: { doctorName: doctor.name, specialization, bedType },
  });

  await recordTimelineEvent({
    referralId: referral._id,
    eventType: "DOCTOR_ASSIGNED",
    description: `${doctor.name} assigned as ${specialization}`,
    metadata: { doctorId: doctor._id.toString(), doctorName: doctor.name, specialization },
  });

  await recordTimelineEvent({
    referralId: referral._id,
    eventType: "BED_RESERVED",
    description: `${bedType} bed reserved at ${hospital.name}`,
    metadata: { hospitalId: hospital._id.toString(), hospitalName: hospital.name, bedType },
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