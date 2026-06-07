const io = require("socket.io-client");

// Socket.IO client configuration for v4
const socket = io("http://localhost:5000", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// ===== CONNECTION EVENTS =====
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server");
  console.log(`Socket ID: ${socket.id}`);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection Error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Disconnected from server:", reason);
});

socket.on("reconnect_attempt", () => {
  console.log("🔄 Attempting to reconnect...");
});

// ===== BUSINESS EVENT LISTENERS =====
socket.on("notificationCreated", (data) => {
  console.log("🔔 Notification:", data);
});

socket.on("referralAccepted", (data) => {
  console.log("✅ Referral Accepted:", data);
});

socket.on("bedReserved", (data) => {
  console.log("🛏️ Bed Reserved:", data);
});

socket.on("reservationExpired", (data) => {
  console.log("⏰ Reservation Expired:", data);
});

socket.on("doctorAssigned", (data) => {
  console.log("👨‍⚕️ Doctor Assigned:", data);
});

// ===== GRACEFUL SHUTDOWN =====
process.on("SIGINT", () => {
  console.log("\n👋 Closing Socket.IO connection...");
  socket.disconnect();
  process.exit(0);
});