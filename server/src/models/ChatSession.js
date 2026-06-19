const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      trim: true,
    },

    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    patientName: {
      type: String,
      default: "",
    },

    condition: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

chatSessionSchema.index({ userId: 1, updatedAt: -1 });
chatSessionSchema.index({ patientId: 1, userId: 1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
