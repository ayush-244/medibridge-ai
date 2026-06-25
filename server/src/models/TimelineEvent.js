const mongoose = require("mongoose");

const TIMELINE_EVENT_TYPES = [
  "REFERRAL_CREATED",
  "AI_AUTOFILL_GENERATED",
  "SPECIALIST_RECOMMENDED",
  "HOSPITAL_RECOMMENDED",
  "REFERRAL_SUBMITTED",
  "REFERRAL_ACCEPTED",
  "REFERRAL_REJECTED",
  "DOCTOR_ASSIGNED",
  "BED_RESERVED",
  "RESERVATION_EXTENDED",
  "PATIENT_ARRIVED",
  "RESERVATION_CANCELLED",
  "RESERVATION_COMPLETED",
  "REFERRAL_COMPLETED",
  "DOCUMENT_UPLOADED",
  "DOCUMENT_REPLACED",
  "DOCUMENT_DELETED",
  "DOCUMENT_VIEWED",
  "DOCUMENT_DOWNLOADED",
];

const timelineEventSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: TIMELINE_EVENT_TYPES,
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actorName: { type: String, default: "System" },
    description: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

timelineEventSchema.index({ referralId: 1, createdAt: -1 });

module.exports = mongoose.model("TimelineEvent", timelineEventSchema);
module.exports.TIMELINE_EVENT_TYPES = TIMELINE_EVENT_TYPES;
