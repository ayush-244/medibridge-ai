const mongoose = require("mongoose");

const bedReservationSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    bedType: {
      type: String,
      enum: ["GENERAL", "ICU"],
      default: "GENERAL",
    },

    reservationStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "ARRIVED",
        "EXPIRED",
        "CANCELLED",
        "COMPLETED",
      ],
      default: "PENDING",
    },

    reservedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BedReservation",
  bedReservationSchema
);