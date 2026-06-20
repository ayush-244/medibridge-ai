const express = require("express");

const {
  COPILOT_ROLES,
  getSessions,
  getSession,
  createSession,
  sendMessage,
  getDocuments,
  getPatientSnapshot,
  getClinicalIntelligence,
  getAnalytics,
} = require("../controllers/copilot.controller");

const authenticateUser = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/sessions",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getSessions,
);

router.get(
  "/sessions/:id",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getSession,
);

router.post(
  "/sessions",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  createSession,
);

router.post(
  "/sessions/:id/messages",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  sendMessage,
);

router.get(
  "/documents/:patientId",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getDocuments,
);

router.get(
  "/snapshot/:patientId",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getPatientSnapshot,
);

router.get(
  "/intelligence/:patientId",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getClinicalIntelligence,
);

router.get(
  "/analytics",
  authenticateUser,
  authorize(...COPILOT_ROLES),
  getAnalytics,
);

module.exports = router;
