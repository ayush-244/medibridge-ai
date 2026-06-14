const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    logo: {
      type: String,
      default: null,
    },

    totalBeds: {
      type: Number,
      required: true,
      min: 0,
    },

    availableBeds: {
      type: Number,
      required: true,
      min: 0,
    },

    totalICUBeds: {
      type: Number,
      required: true,
      min: 0,
    },

    availableICUBeds: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },

    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Hospital = mongoose.model("Hospital", hospitalSchema);

module.exports = Hospital;