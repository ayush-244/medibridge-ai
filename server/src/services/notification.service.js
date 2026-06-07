const Notification = require(
  "../models/Notification"
);

const createNotification = async ({
  title,
  message,
  type = "INFO",
}) => {
  try {
    await Notification.create({
      title,
      message,
      type,
    });
  } catch (error) {
    console.error(
      "Notification Error:",
      error
    );
  }
};

module.exports = createNotification;