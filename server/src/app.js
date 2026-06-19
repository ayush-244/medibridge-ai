const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const hospitalRoutes = require("./routes/hospital.routes");
const referralRoutes = require("./routes/referral.routes");
const recommendationRoutes = require("./routes/recommendation.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const aiRoutes = require("./routes/ai.routes");
const doctorRoutes = require("./routes/doctor.routes");
const reservationRoutes = require("./routes/reservation.routes");
const activityRoutes = require("./routes/activity.routes");
const notificationRoutes = require(
  "./routes/notification.routes"
);
const smartReferralRoutes = require(
  "./routes/smartReferral.routes"
);
const adminRoutes = require(
  "./routes/admin.routes"
);
const userRoutes = require("./routes/user.routes");
const uploadRoutes = require("./routes/upload.routes");
const copilotRoutes = require("./routes/copilot.routes");

const doctorDashboardRoutes = require(
  "./routes/doctorDashboard.routes"
);

const reportRoutes = require(
  "./routes/report.routes"
);

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/referrals", referralRoutes);
app.use(
  "/api/recommendations",
  recommendationRoutes
);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/doctors", doctorRoutes);
app.use(
  "/api/doctor-dashboard",
  doctorDashboardRoutes
);
app.use(
  "/api/reservations",
  reservationRoutes
);
app.use("/api/activities", activityRoutes);
app.use(
  "/api/notifications",
  notificationRoutes
);
app.use(
  "/api/smart-referrals",
  smartReferralRoutes
);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/copilot", copilotRoutes);
app.use(
  "/api/reports",
  reportRoutes
);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MediBridge API Running",
  });
});

module.exports = app;
