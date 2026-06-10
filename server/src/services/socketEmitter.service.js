const emitEvent = (eventName, data) => {
  try {
    // Lazy load getIO to avoid circular dependency issues
    // This ensures socket.js is initialized before we try to access it
    const { getIO } = require("../config/socket");
    const io = getIO();

    console.log(
      `[SOCKET] ${eventName}`,
      data
    );

    io.emit(eventName, data);
  } catch (error) {
    console.error(
      "Socket Emit Error:",
      error
    );
  }
};

module.exports = emitEvent;