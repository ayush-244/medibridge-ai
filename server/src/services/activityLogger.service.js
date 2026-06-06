const ActivityLog = require("../models/ActivityLog");

const logActivity = async ({
  action,
  entityType,
  entityId,
  description,
  performedBy = "SYSTEM",
}) => {
  try {
    await ActivityLog.create({
      action,
      entityType,
      entityId,
      description,
      performedBy,
    });
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
};

module.exports = logActivity;