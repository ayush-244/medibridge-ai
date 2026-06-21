const Referral = require("../models/Referral");
const axios = require("axios");
const multer = require("multer");
const path = require("path");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

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

/**
 * POST /api/referrals/:referralId/recommendations/specialist
 *
 * Loads the referral, verifies authorization, builds context payload,
 * calls the AI service /recommend-specialist, and returns the result.
 * The frontend never needs to supply patient_id or any manual identifier.
 */
const getSpecialistRecommendation = async (req, res) => {
  try {
    const { referralId } = req.params;

    // Load referral and populate hospitals for authorization check
    const referral = await Referral.findById(referralId)
      .populate("fromHospital", "name city location")
      .populate("toHospital", "name city location");

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    // Authorization: SUPER_ADMIN can access all; HOSPITAL_ADMIN and
    // REFERRAL_COORDINATOR must belong to the source or destination hospital
    if (req.user.role !== "SUPER_ADMIN") {
      const userHospital = req.user.hospital?.toString();
      const fromHospital =
        typeof referral.fromHospital === "string"
          ? referral.fromHospital
          : referral.fromHospital?._id?.toString();
      const toHospital =
        typeof referral.toHospital === "string"
          ? referral.toHospital
          : referral.toHospital?._id?.toString();

      if (userHospital !== fromHospital && userHospital !== toHospital) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission to view this referral.",
        });
      }
    }

    // Build referral context payload — patient_id uses referral._id as
    // ChromaDB scope key (interim until Phase 20.2D introduces MB-PAT IDs)
    const payload = {
      patient_id: referral._id.toString(),
      patientName: referral.patientName,
      age: referral.age,
      condition: referral.condition,
    };

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/recommend-specialist`,
      payload,
      { timeout: 60000 },
    );

    const aiData = aiResponse.data;

    if (!aiData.success) {
      return res.status(502).json({
        success: false,
        message: aiData.message || "AI service failed to generate recommendation",
      });
    }

    return res.status(200).json({
      success: true,
      data: aiData.data,
    });
  } catch (error) {
    console.error("[referralRecommendations] specialist error:", error?.message || error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid referral ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate specialist recommendation",
    });
  }
};

/**
 * POST /api/referrals/:referralId/recommendations/hospitals
 *
 * Loads the referral, verifies authorization, then calls the AI service
 * /hospital-match endpoint. Derives all required IDs server-side.
 */
const getHospitalRecommendations = async (req, res) => {
  try {
    const { referralId } = req.params;

    const referral = await Referral.findById(referralId)
      .populate("fromHospital", "name city location")
      .populate("toHospital", "name city location");

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    // Authorization check
    if (req.user.role !== "SUPER_ADMIN") {
      const userHospital = req.user.hospital?.toString();
      const fromHospital =
        typeof referral.fromHospital === "string"
          ? referral.fromHospital
          : referral.fromHospital?._id?.toString();
      const toHospital =
        typeof referral.toHospital === "string"
          ? referral.toHospital
          : referral.toHospital?._id?.toString();

      if (userHospital !== fromHospital && userHospital !== toHospital) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission to view this referral.",
        });
      }
    }

    // Both patient_id and referral_id use referral._id (interim approach).
    // The AI service uses patient_id for ChromaDB document scope and
    // referral_id to load hospital/doctor data via the Node API.
    const payload = {
      patient_id: referral._id.toString(),
      referral_id: referral._id.toString(),
    };

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/hospital-match`,
      payload,
      { timeout: 90000 },
    );

    const aiData = aiResponse.data;

    if (!aiData.success) {
      return res.status(502).json({
        success: false,
        message: aiData.message || "AI service failed to generate hospital recommendations",
      });
    }

    return res.status(200).json({
      success: true,
      data: aiData.data,
    });
  } catch (error) {
    console.error("[referralRecommendations] hospitals error:", error?.message || error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid referral ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate hospital recommendations",
    });
  }
};

const uploadReferralDocument = async (req, res) => {
  try {
    const { referralId } = req.params;

    const referral = await Referral.findById(referralId);
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    if (req.user.role !== "SUPER_ADMIN") {
      const userHospital = req.user.hospital?.toString();
      const fromHospital =
        typeof referral.fromHospital === "string"
          ? referral.fromHospital
          : referral.fromHospital?._id?.toString();
      const toHospital =
        typeof referral.toHospital === "string"
          ? referral.toHospital
          : referral.toHospital?._id?.toString();

      if (userHospital !== fromHospital && userHospital !== toHospital) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission to upload to this referral.",
        });
      }
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: "application/pdf" });
    formData.append("file", blob, req.file.originalname);
    formData.append("patient_id", referralId);
    formData.append("uploaded_by", req.user.id);

    const response = await fetch(`${AI_SERVICE_URL}/api/ai/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(502).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[referralRecommendations] document upload error:", error?.message || error);
    console.error("[diag] getAiHospitals catch block:");
    console.error("[diag]   message:", error?.message);
    if (error?.response) {
      console.error("[diag]   status:", error.response.status);
      console.error("[diag]   response data:", JSON.stringify(error.response.data));
    } else if (error?.request) {
      console.error("[diag]   no response received (network/timeout)");
    }
    console.error("[diag]   stack:", error?.stack?.split("\n").slice(0, 4).join("\n"));

    return res.status(500).json({
      success: false,
      message: "Failed to generate hospital recommendations",
    });
  }
};

/**
 * POST /api/referrals/ai-specialist
 *
 * Pre-referral specialist recommendation. Does not require a referralId;
 * accepts patient clinical fields directly + optional patientId for
 * ChromaDB document scope (pre-referral temp UUID).
 */
const getAiSpecialist = async (req, res) => {
  try {
    const { patientId, patientName, age, condition } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId is required",
      });
    }

    const payload = {
      patient_id: patientId,
      patientName: patientName || "",
      age: age || 0,
      condition: condition || "",
    };

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/recommend-specialist`,
      payload,
      { timeout: 60000 },
    );

    const aiData = aiResponse.data;

    if (!aiData.success) {
      return res.status(502).json({
        success: false,
        message: aiData.message || "AI service failed to generate recommendation",
      });
    }

    return res.status(200).json({
      success: true,
      data: aiData.data,
    });
  } catch (error) {
    console.error("[referralRecommendations] AI specialist error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate specialist recommendation",
    });
  }
};

/**
 * POST /api/referrals/ai-hospitals
 *
 * Pre-referral hospital recommendations. Requires originHospitalId
 * (selected "From Hospital" in the form) + patientId for ChromaDB scope.
 * The AI service derives hospital/doctor/matching data server-side.
 */
const getAiHospitals = async (req, res) => {
  try {
    const { patientId, originHospitalId } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId is required",
      });
    }

    if (!originHospitalId) {
      return res.status(400).json({
        success: false,
        message: "originHospitalId is required",
      });
    }

    const payload = {
      patient_id: patientId,
      referral_id: originHospitalId,
      origin_hospital_id: originHospitalId,
    };

    console.log("[diag] getAiHospitals payload:", JSON.stringify(payload));

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/ai/hospital-match`,
      payload,
      { timeout: 90000 },
    );

    console.log("[diag] AI response status:", aiResponse.status);
    console.log("[diag] AI response data:", JSON.stringify(aiResponse.data).slice(0, 500));

    const aiData = aiResponse.data;

    if (!aiData.success) {
      return res.status(502).json({
        success: false,
        message: aiData.message || "AI service failed to generate hospital recommendations",
      });
    }

    return res.status(200).json({
      success: true,
      data: aiData.data,
    });
  } catch (error) {
    console.error("[referralRecommendations] AI hospitals error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate hospital recommendations",
    });
  }
};

module.exports = {
  getSpecialistRecommendation,
  getHospitalRecommendations,
  getAiSpecialist,
  getAiHospitals,
  uploadReferralDocument,
  pdfUpload,
};
