const { getIO } = require("../config/socket");

const emitEvent = (eventName, data) => {
  try {
    const io = getIO();

    console.log(`[SOCKET] ${eventName}`, data);

    io.emit(eventName, data);
  } catch (error) {
    console.error("Socket Emit Error:", error);
  }
};

emitEvent("dashboardUpdated", {
  timestamp: new Date(),
});

module.exports = emitEvent;