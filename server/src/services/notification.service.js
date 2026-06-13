const Notification = require("../models/Notification");

const emitEvent = require("./socketEmitter.service");

const createNotification = async ({ title, message, type = "INFO" }) => {
  try {
    await Notification.create({
      title,
      message,
      type,
    });

    emitEvent("notificationCreated", {
      title,
      message,
      type,
    });
    
  } catch (error) {
    console.error("Notification Error:", error);
  }
};

module.exports = createNotification;
