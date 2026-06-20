const mongoose = require("mongoose");

const copilotAnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      default: null,
    },
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "SESSION_STARTED",
        "QUESTION_ASKED",
        "RESPONSE_GENERATED",
        "SNAPSHOT_GENERATED",
        "RISK_ANALYSIS_GENERATED",
      ],
      index: true,
    },
    diagnosis: { type: String, default: "" },
    specialist: { type: String, default: "" },
    confidence: { type: Number, default: 0 },
    referralConverted: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

copilotAnalyticsSchema.index({ createdAt: -1 });
copilotAnalyticsSchema.index({ eventType: 1, createdAt: -1 });

module.exports = mongoose.model("CopilotAnalytics", copilotAnalyticsSchema);
