const BedReservation = require("../models/BedReservation");
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const logActivity = require("./activityLogger.service");
const createNotification = require("./notification.service");
const emitEvent = require("./socketEmitter.service");
const { recordTimelineEvent } = require("./timeline.service");

const VALID_DURATIONS = [1, 2, 4, 6, 12, 24];

const releaseResources = async (reservation) => {
  const hospital = await Hospital.findById(reservation.hospital);

  if (hospital) {
    if (reservation.bedType === "ICU") {
      hospital.availableICUBeds = Math.min(
        hospital.totalICUBeds,
        hospital.availableICUBeds + 1,
      );
    } else {
      hospital.availableBeds = Math.min(
        hospital.totalBeds,
        hospital.availableBeds + 1,
      );
    }
    await hospital.save();
    emitEvent("hospitalUpdated", {
      hospitalId: hospital._id,
      name: hospital.name,
    });
  }

  const doctor = await Doctor.findById(reservation.doctor);

  if (doctor) {
    doctor.currentPatients = Math.max(0, doctor.currentPatients - 1);
    if (doctor.currentPatients < doctor.maxPatients) {
      doctor.status = "AVAILABLE";
    }
    await doctor.save();
    emitEvent("doctorUpdated", {
      doctorId: doctor._id,
      doctorName: doctor.name,
    });
  }
};

const patientArrived = async (reservationId, performedBy) => {
  const reservation = await BedReservation.findById(reservationId);

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  if (reservation.reservationStatus !== "CONFIRMED") {
    throw new Error("Only active reservations can be marked as arrived");
  }

  reservation.reservationStatus = "ARRIVED";
  await reservation.save();

  await recordTimelineEvent({
    referralId: reservation.referral,
    eventType: "PATIENT_ARRIVED",
    actorId: performedBy,
    description: `Patient ${reservation.patientName} arrived at the hospital`,
  });

  await logActivity({
    action: "PATIENT_ARRIVED",
    entityType: "Reservation",
    entityId: reservation._id,
    description: `Patient ${reservation.patientName} arrived`,
    performedBy,
  });

  await createNotification({
    title: "Patient Arrived",
    message: `${reservation.patientName} has arrived`,
    type: "SUCCESS",
  });

  emitEvent("patientArrived", {
    reservationId: reservation._id,
    patientName: reservation.patientName,
  });

  emitEvent("dashboardUpdated", { action: "PATIENT_ARRIVED" });

  return reservation;
};

const extendReservation = async (reservationId, durationHours, performedBy) => {
  if (!VALID_DURATIONS.includes(durationHours)) {
    throw new Error("Invalid reservation duration");
  }

  const reservation = await BedReservation.findById(reservationId);

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  if (!["CONFIRMED", "ARRIVED"].includes(reservation.reservationStatus)) {
    throw new Error("Only active reservations can be extended");
  }

  const newExpiry = new Date(
    Math.max(Date.now(), reservation.expiresAt.getTime()) +
      durationHours * 60 * 60 * 1000,
  );

  reservation.expiresAt = newExpiry;
  if (reservation.reservationStatus === "EXPIRED") {
    reservation.reservationStatus = "CONFIRMED";
  }
  await reservation.save();

  await recordTimelineEvent({
    referralId: reservation.referral,
    eventType: "RESERVATION_EXTENDED",
    actorId: performedBy,
    description: `Reservation extended by ${durationHours}h for ${reservation.patientName}`,
    metadata: { durationHours },
  });

  await logActivity({
    action: "RESERVATION_EXTENDED",
    entityType: "Reservation",
    entityId: reservation._id,
    description: `Reservation extended by ${durationHours}h for ${reservation.patientName}`,
    performedBy,
  });

  emitEvent("reservationExtended", {
    reservationId: reservation._id,
    patientName: reservation.patientName,
    durationHours,
  });

  emitEvent("dashboardUpdated", { action: "RESERVATION_EXTENDED" });

  return reservation;
};

const cancelReservation = async (reservationId, performedBy) => {
  const reservation = await BedReservation.findById(reservationId);

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  if (!["CONFIRMED", "ARRIVED", "PENDING"].includes(reservation.reservationStatus)) {
    throw new Error("Reservation cannot be cancelled");
  }

  reservation.reservationStatus = "CANCELLED";
  await reservation.save();

  await releaseResources(reservation);

  await recordTimelineEvent({
    referralId: reservation.referral,
    eventType: "RESERVATION_CANCELLED",
    actorId: performedBy,
    description: `Reservation cancelled for ${reservation.patientName}`,
  });

  await logActivity({
    action: "RESERVATION_CANCELLED",
    entityType: "Reservation",
    entityId: reservation._id,
    description: `Reservation cancelled for ${reservation.patientName}`,
    performedBy,
  });

  await createNotification({
    title: "Reservation Cancelled",
    message: `${reservation.patientName} reservation cancelled`,
    type: "WARNING",
  });

  emitEvent("reservationCancelled", {
    reservationId: reservation._id,
    patientName: reservation.patientName,
  });

  emitEvent("dashboardUpdated", { action: "RESERVATION_CANCELLED" });

  return reservation;
};

const completeReservation = async (reservationId, performedBy) => {
  const reservation = await BedReservation.findById(reservationId);

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  if (reservation.reservationStatus !== "ARRIVED") {
    throw new Error("Only arrived reservations can be completed");
  }

  reservation.reservationStatus = "COMPLETED";
  await reservation.save();

  await releaseResources(reservation);

  await recordTimelineEvent({
    referralId: reservation.referral,
    eventType: "RESERVATION_COMPLETED",
    actorId: performedBy,
    description: `Reservation completed for ${reservation.patientName}`,
  });

  await logActivity({
    action: "RESERVATION_COMPLETED",
    entityType: "Reservation",
    entityId: reservation._id,
    description: `Reservation completed for ${reservation.patientName}`,
    performedBy,
  });

  emitEvent("dashboardUpdated", { action: "RESERVATION_COMPLETED" });

  return reservation;
};

module.exports = {
  VALID_DURATIONS,
  patientArrived,
  extendReservation,
  cancelReservation,
  completeReservation,
};
