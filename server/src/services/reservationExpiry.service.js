const cron = require("node-cron");

const BedReservation = require("../models/BedReservation");
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const logActivity = require("./activityLogger.service");

const startReservationExpiryJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Checking expired reservations...");

      const expiredReservations =
        await BedReservation.find({
          reservationStatus: "CONFIRMED",
          expiresAt: { $lt: new Date() },
        });

      for (const reservation of expiredReservations) {
        // Mark reservation expired
        reservation.reservationStatus = "EXPIRED";
        await reservation.save();

        await logActivity({
          action: "RESERVATION_EXPIRED",
          entityType: "Reservation",
          entityId: reservation._id,
          description: `Reservation expired for ${reservation.patientName}`,
        });

        // Release bed
        const hospital = await Hospital.findById(
          reservation.hospital
        );

        if (hospital) {
          hospital.availableBeds += 1;
          await hospital.save();
        }

        // Release doctor
        const doctor = await Doctor.findById(
          reservation.doctor
        );

        if (doctor) {
          doctor.currentPatients = Math.max(
            0,
            doctor.currentPatients - 1
          );

          if (doctor.currentPatients === 0) {
            doctor.status = "AVAILABLE";
          }

          await doctor.save();
        }

        console.log(
          `Reservation expired: ${reservation._id}`
        );
      }
    } catch (error) {
      console.error(
        "Reservation expiry job failed:",
        error
      );
    }
  });
};

module.exports = startReservationExpiryJob;