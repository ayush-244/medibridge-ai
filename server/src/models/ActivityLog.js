const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },

    entityType: {
      type: String,
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    performedBy: {
      type: String,
      default: "SYSTEM",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ActivityLog",
  activityLogSchema
);