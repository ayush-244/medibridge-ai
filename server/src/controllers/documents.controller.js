const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const ReferralDocument = require("../models/ReferralDocument");
const emitEvent = require("../services/socketEmitter.service");

const uploadTempDocument = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId is required",
      });
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
    formData.append("patient_id", patientId);
    formData.append("uploaded_by", req.user.id);

    const response = await fetch(`${AI_SERVICE_URL}/api/ai/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(502).json(result);
    }

    const storedFilename = result.data?.filename || `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;

    await ReferralDocument.create({
      referralId: null,
      tempPatientId: patientId,
      filename: storedFilename,
      originalFilename: req.file.originalname,
      uploadedBy: req.user._id || req.user.id,
      uploadedByName: req.user?.name || "System",
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileData: req.file.buffer,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[documents] upload-temp error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  }
};

const reScopeDocuments = async (req, res) => {
  try {
    const { fromPatientId, toPatientId } = req.body;

    if (!fromPatientId || !toPatientId) {
      return res.status(400).json({
        success: false,
        message: "fromPatientId and toPatientId are required",
      });
    }

    if (fromPatientId === toPatientId) {
      return res.status(400).json({
        success: false,
        message: "fromPatientId and toPatientId must differ",
      });
    }

    const response = await fetch(
      `${AI_SERVICE_URL}/api/ai/documents/re-scope`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_patient_id: fromPatientId,
          to_patient_id: toPatientId,
        }),
      },
    );

    const result = await response.json();

    if (!result.success) {
      return res.status(502).json(result);
    }

    const updateResult = await ReferralDocument.updateMany(
      { tempPatientId: fromPatientId },
      { $set: { referralId: toPatientId, tempPatientId: null } },
    );

    if (updateResult.modifiedCount > 0) {
      emitEvent("documentUploaded", {
        referralId: toPatientId,
        documentId: null,
        filename: `${updateResult.modifiedCount} documents re-scoped`,
      });
      emitEvent("dashboardUpdated", { action: "DOCUMENTS_RE_SCOPED" });
    }

    return res.status(200).json({
      ...result,
      data: {
        ...result.data,
        documentsReassigned: updateResult.modifiedCount,
      },
    });
  } catch (error) {
    console.error("[documents] re-scope error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to reassign documents",
    });
  }
};

module.exports = {
  uploadTempDocument,
  reScopeDocuments,
};
