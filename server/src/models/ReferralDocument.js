const mongoose = require("mongoose");

const referralDocumentSchema = new mongoose.Schema(
  {
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      default: null,
      index: true,
    },
    tempPatientId: {
      type: String,
      default: null,
      index: true,
    },
    filename: { type: String, required: true },
    originalFilename: { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    uploadedByName: { type: String, default: "System" },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "application/pdf" },
    chunkCount: { type: Number, default: 0 },
    fileData: { type: Buffer, default: null },
  },
  { timestamps: true },
);

referralDocumentSchema.index({ referralId: 1, createdAt: -1 });
referralDocumentSchema.index({ tempPatientId: 1 });

module.exports = mongoose.model("ReferralDocument", referralDocumentSchema);
