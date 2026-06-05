require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const startReservationExpiryJob = require(
  "./src/services/reservationExpiry.service"
);

(async () => {
  await connectDB();

  // Start background jobs
  startReservationExpiryJob();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();