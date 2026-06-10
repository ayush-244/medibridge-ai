require("dotenv").config();

const http = require("http");

const connectDB = require("./src/config/db");
const {
  initializeSocket,
} = require("./src/config/socket");

// Import app AFTER socket config to avoid circular dependency issues
const app = require("./src/app");

const startReservationExpiryJob = require(
  "./src/services/reservationExpiry.service"
);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    // Initialize socket BEFORE starting background jobs
    // This ensures Socket.IO is ready when services try to emit events
    initializeSocket(server);

    // Start background jobs after socket is initialized
    startReservationExpiryJob();

    server.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Server initialization error:", error);
    process.exit(1);
  }
})();