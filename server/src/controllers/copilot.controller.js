const ChatSession = require("../models/ChatSession");
const ChatMessage = require("../models/ChatMessage");
const Referral = require("../models/Referral");
const logActivity = require("../services/activityLogger.service");
const emitEvent = require("../services/socketEmitter.service");
const {
  trackCopilotEvent,
  getCopilotAnalyticsSummary,
} = require("../services/copilotAnalytics.service");
const multer = require("multer");
const path = require("path");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype !== "application/pdf" || ext !== ".pdf") {
      cb(new Error("Only PDF files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const COPILOT_ROLES = [
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
  "REFERRAL_COORDINATOR",
  "DOCTOR",
];

const AI_API = AI_SERVICE_URL.includes("/api/ai")
  ? AI_SERVICE_URL
  : `${AI_SERVICE_URL}/api/ai`;

async function callAiChat(patientId, question) {
  const response = await fetch(`${AI_API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patient_id: patientId,
      question,
    }),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to generate AI response.");
  }

  return body.data;
}

async function callAiDocuments(patientId) {
  const response = await fetch(
    `${AI_API}/documents/${encodeURIComponent(patientId)}`,
  );

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to fetch documents.");
  }

  return body.data || [];
}

async function callAiSnapshot(patientId) {
  const response = await fetch(`${AI_API}/patient-snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient_id: patientId }),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to generate patient snapshot.");
  }

  return body.data;
}

async function callAiClinicalIntelligence(patientId) {
  const response = await fetch(`${AI_API}/clinical-intelligence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient_id: patientId }),
  });

  const body = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.message || "Failed to generate clinical intelligence.");
  }

  return body.data;
}

function buildSessionTitle(question) {
  const trimmed = question.trim();
  if (trimmed.length <= 60) {
    return trimmed;
  }
  return `${trimmed.slice(0, 57)}...`;
}

const getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const messages = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        session,
        messages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const createSession = async (req, res) => {
  try {
    const { patientId, referralId, patientName, condition, title } = req.body;

    if (!patientId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    let resolvedPatientName = patientName || "";
    let resolvedCondition = condition || "";
    let resolvedReferralId = referralId || null;

    if (referralId) {
      const referral = await Referral.findById(referralId).lean();
      if (referral) {
        resolvedPatientName = referral.patientName;
        resolvedCondition = referral.condition;
        resolvedReferralId = referral._id;
      }
    }

    const session = await ChatSession.create({
      patientId: patientId.trim(),
      referralId: resolvedReferralId,
      userId: req.user.id,
      title: title?.trim() || (resolvedPatientName
        ? `${resolvedPatientName} Clinical Session`
        : `${patientId.trim()} Clinical Session`
      ),
      patientName: resolvedPatientName,
      condition: resolvedCondition,
    });

    await logActivity({
      action: "COPILOT_SESSION_STARTED",
      entityType: "ChatSession",
      entityId: session._id,
      description: `Clinical Copilot session started for ${resolvedPatientName || patientId.trim()}`,
      performedBy: req.user.id,
    });

    await trackCopilotEvent({
      userId: req.user.id,
      sessionId: session._id,
      patientId: session.patientId,
      eventType: "SESSION_STARTED",
      diagnosis: resolvedCondition,
    });

    emitEvent("copilotSessionStarted", {
      sessionId: session._id.toString(),
      patientId: session.patientId,
      patientName: session.patientName,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { question } = req.body;
    const sessionId = req.params.id;

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const sanitizedQuestion = question.trim();

    const userMessage = await ChatMessage.create({
      sessionId: session._id,
      role: "user",
      content: sanitizedQuestion,
    });

    await logActivity({
      action: "COPILOT_QUESTION_ASKED",
      entityType: "ChatSession",
      entityId: session._id,
      description: `Copilot question for ${session.patientName || session.patientId}: ${sanitizedQuestion.slice(0, 80)}`,
      performedBy: req.user.id,
    });

    await trackCopilotEvent({
      userId: req.user.id,
      sessionId: session._id,
      patientId: session.patientId,
      eventType: "QUESTION_ASKED",
    });

    emitEvent("copilotQuestionAsked", {
      sessionId: session._id.toString(),
      patientId: session.patientId,
      question: sanitizedQuestion,
      userId: req.user.id,
    });

    let aiResponse;

    try {
      aiResponse = await callAiChat(session.patientId, sanitizedQuestion);
    } catch (aiError) {
      console.error(aiError);
      return res.status(502).json({
        success: false,
        message: aiError.message || "Failed to generate AI response.",
      });
    }

    const assistantMessage = await ChatMessage.create({
      sessionId: session._id,
      role: "assistant",
      content: aiResponse.answer,
      summary: aiResponse.summary || "",
      evidence: aiResponse.evidence || [],
      confidence: aiResponse.confidence || 0,
      citations: aiResponse.citations || [],
      suggestedQuestions: aiResponse.suggestedQuestions || [],
    });

    const messageCount = await ChatMessage.countDocuments({
      sessionId: session._id,
      role: "user",
    });

    if (messageCount === 1) {
      session.title = buildSessionTitle(sanitizedQuestion);
    }

    session.updatedAt = new Date();
    await session.save();

    await logActivity({
      action: "COPILOT_RESPONSE_GENERATED",
      entityType: "ChatSession",
      entityId: session._id,
      description: `Copilot response generated for ${session.patientName || session.patientId} (confidence ${aiResponse.confidence || 0}%)`,
      performedBy: req.user.id,
    });

    await trackCopilotEvent({
      userId: req.user.id,
      sessionId: session._id,
      patientId: session.patientId,
      eventType: "RESPONSE_GENERATED",
      confidence: aiResponse.confidence || 0,
      diagnosis: session.condition || "",
    });

    emitEvent("copilotResponseGenerated", {
      sessionId: session._id.toString(),
      patientId: session.patientId,
      confidence: aiResponse.confidence || 0,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        session,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const cursor = parseInt(req.query.cursor, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 20;

    if (!patientId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const documents = await callAiDocuments(patientId.trim());
    const paginated = documents.slice(cursor, cursor + limit);
    const hasMore = cursor + limit < documents.length;

    res.status(200).json({
      success: true,
      data: {
        documents: paginated,
        total: documents.length,
        hasMore,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(502).json({
      success: false,
      message: error.message || "Failed to fetch documents.",
    });
  }
};

const getPatientSnapshot = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const snapshot = await callAiSnapshot(patientId.trim());

    await logActivity({
      action: "PATIENT_SNAPSHOT_GENERATED",
      entityType: "Patient",
      entityId: patientId.trim(),
      description: `AI patient snapshot generated for patient (${snapshot.primaryDiagnosis})`,
      performedBy: req.user.id,
    });

    await logActivity({
      action: "RISK_ANALYSIS_GENERATED",
      entityType: "Patient",
      entityId: patientId.trim(),
      description: `Risk analysis generated for patient (${snapshot.riskLevel} risk)`,
      performedBy: req.user.id,
    });

    await trackCopilotEvent({
      userId: req.user.id,
      patientId: patientId.trim(),
      eventType: "SNAPSHOT_GENERATED",
      diagnosis: snapshot.primaryDiagnosis || "",
      specialist: snapshot.recommendedSpecialist || "",
      confidence: snapshot.confidence || 0,
    });

    await trackCopilotEvent({
      userId: req.user.id,
      patientId: patientId.trim(),
      eventType: "RISK_ANALYSIS_GENERATED",
      diagnosis: snapshot.primaryDiagnosis || "",
      specialist: snapshot.recommendedSpecialist || "",
      confidence: snapshot.confidence || 0,
      metadata: {
        riskLevel: snapshot.riskLevel,
        urgency: snapshot.urgency,
        transferRecommendation: snapshot.transferRecommendation,
      },
    });

    emitEvent("patientSnapshotGenerated", {
      patientId: patientId.trim(),
      diagnosis: snapshot.primaryDiagnosis,
      riskLevel: snapshot.riskLevel,
      confidence: snapshot.confidence,
      userId: req.user.id,
    });

    emitEvent("riskAnalysisGenerated", {
      patientId: patientId.trim(),
      riskLevel: snapshot.riskLevel,
      urgency: snapshot.urgency,
      specialist: snapshot.recommendedSpecialist,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error(error);
    res.status(502).json({
      success: false,
      message: error.message || "Failed to generate patient snapshot.",
    });
  }
};

const getClinicalIntelligence = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const intelligence = await callAiClinicalIntelligence(patientId.trim());

    await logActivity({
      action: "RISK_ANALYSIS_GENERATED",
      entityType: "Patient",
      entityId: patientId.trim(),
      description: `Risk analysis generated for patient (${intelligence.riskLevel} risk)`,
      performedBy: req.user.id,
    });

    await trackCopilotEvent({
      userId: req.user.id,
      patientId: patientId.trim(),
      eventType: "RISK_ANALYSIS_GENERATED",
      diagnosis: intelligence.primaryDiagnosis || "",
      specialist: intelligence.recommendedSpecialist || "",
      confidence: intelligence.confidence || 0,
      metadata: {
        riskLevel: intelligence.riskLevel,
        urgency: intelligence.urgency,
        transferRecommendation: intelligence.transferRecommendation,
      },
    });

    emitEvent("riskAnalysisGenerated", {
      patientId: patientId.trim(),
      riskLevel: intelligence.riskLevel,
      urgency: intelligence.urgency,
      specialist: intelligence.recommendedSpecialist,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: intelligence,
    });
  } catch (error) {
    console.error(error);
    res.status(502).json({
      success: false,
      message: error.message || "Failed to generate clinical intelligence.",
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const summary = await getCopilotAnalyticsSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    const patientId = req.body.patient_id || `doc-${Date.now()}`;
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: "application/pdf" });
    formData.append("file", blob, req.file.originalname);
    formData.append("patient_id", patientId);
    formData.append("uploaded_by", req.user.id);

    const response = await fetch(`${AI_API}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(502).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("[copilot] document upload error:", error?.message || error);
    res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  }
};

module.exports = {
  COPILOT_ROLES,
  getSessions,
  getSession,
  createSession,
  sendMessage,
  getDocuments,
  getPatientSnapshot,
  getClinicalIntelligence,
  getAnalytics,
  uploadDocument,
  pdfUpload,
};
