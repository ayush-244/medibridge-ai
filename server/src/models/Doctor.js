const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFF_DUTY"],
      default: "AVAILABLE",
    },

    phone: {
      type: String,
      trim: true,
    },

    currentPatients: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxPatients: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Doctor", doctorSchema);
