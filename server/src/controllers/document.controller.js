const Referral = require("../models/Referral");
const {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  replaceDocument,
} = require("../services/referralDocument.service");

const getReferralDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const docs = await getDocuments(id);
    return res.status(200).json({ success: true, data: docs });
  } catch (error) {
    console.error("[documents] list error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
};

const uploadReferralDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral not found" });
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
      return res.status(400).json({ success: false, message: "PDF file is required" });
    }

    const doc = await uploadDocument({
      referralId: id,
      originalFilename: req.file.originalname,
      uploadedBy: req.user._id || req.user.id,
      uploadedByName: req.user?.name || "System",
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileData: req.file.buffer,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error("[documents] upload error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Failed to upload document" });
  }
};

const deleteReferralDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;

    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral not found" });
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
          message: "Access denied.",
        });
      }
    }

    await deleteDocument(
      documentId,
      id,
      req.user._id || req.user.id,
      req.user?.name || "System",
    );

    return res.status(200).json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("[documents] delete error:", error?.message || error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete document" });
  }
};

const downloadReferralDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const doc = await getDocumentById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    if (!doc.fileData) {
      return res.status(404).json({ success: false, message: "File data not available" });
    }

    res.setHeader("Content-Type", doc.mimeType || "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${doc.originalFilename}"`,
    );
    res.setHeader("Content-Length", doc.fileSize);
    return res.send(doc.fileData);
  } catch (error) {
    console.error("[documents] download error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Failed to download document" });
  }
};

const replaceReferralDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;

    const referral = await Referral.findById(id);
    if (!referral) {
      return res.status(404).json({ success: false, message: "Referral not found" });
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
          message: "Access denied.",
        });
      }
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file is required" });
    }

    const doc = await replaceDocument(
      documentId,
      id,
      req.file.buffer,
      req.file.originalname,
      req.user._id || req.user.id,
      req.user?.name || "System",
    );

    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error("[documents] replace error:", error?.message || error);
    return res.status(500).json({ success: false, message: error.message || "Failed to replace document" });
  }
};

module.exports = {
  getReferralDocuments,
  uploadReferralDocument,
  deleteReferralDocument,
  downloadReferralDocument,
  replaceReferralDocument,
};
