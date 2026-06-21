const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

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

    return res.status(200).json(result);
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
