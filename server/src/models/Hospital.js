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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Hospital",
  hospitalSchema
);