let io = null;

const initializeSocket = (server) => {
  if (io) {
    console.warn("Socket.IO already initialized");
    return io;
  }

  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(
      `Client Connected: ${socket.id}`
    );

    socket.on("disconnect", () => {
      console.log(
        `Client Disconnected: ${socket.id}`
      );
    });
  });

  console.log("Socket.IO initialized successfully");
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized. Call initializeSocket(server) first."
    );
  }

  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};