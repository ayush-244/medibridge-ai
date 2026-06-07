require("dotenv").config();

const http = require("http");

const app = require("./src/app");
const connectDB = require("./src/config/db");

const startReservationExpiryJob = require(
  "./src/services/reservationExpiry.service"
);

const {
  initializeSocket,
} = require("./src/config/socket");

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();

  // Start background jobs
  startReservationExpiryJob();

  const server = http.createServer(app);

  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT}`
    );
  });
})();