const ReferralDocument = require("../models/ReferralDocument");
const { recordTimelineEvent } = require("./timeline.service");
const emitEvent = require("./socketEmitter.service");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const AI_API = AI_SERVICE_URL.includes("/api/ai")
  ? AI_SERVICE_URL
  : `${AI_SERVICE_URL}/api/ai`;

async function getDocuments(referralId) {
  return ReferralDocument.find({ referralId })
    .select("-fileData")
    .sort({ createdAt: -1 })
    .lean();
}

async function getDocumentById(documentId) {
  return ReferralDocument.findById(documentId);
}

async function uploadDocument({
  referralId,
  originalFilename,
  uploadedBy,
  uploadedByName,
  fileSize,
  mimeType,
  fileData,
}) {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;

  const doc = await ReferralDocument.create({
    referralId,
    filename,
    originalFilename,
    uploadedBy,
    uploadedByName,
    fileSize,
    mimeType,
    fileData,
  });

  const formData = new FormData();
  const blob = new Blob([fileData], { type: "application/pdf" });
  formData.append("file", blob, originalFilename);
  formData.append("patient_id", referralId.toString());
  formData.append("uploaded_by", uploadedBy?.toString() || "");

  try {
    const response = await fetch(`${AI_API}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success && typeof result.data?.chunks_stored === "number") {
      doc.chunkCount = result.data.chunks_stored;
      await doc.save();
    }
  } catch (error) {
    console.error("[referralDocument] AI upload failed:", error?.message || error);
  }

  await recordTimelineEvent({
    referralId,
    eventType: "DOCUMENT_UPLOADED",
    actorId: uploadedBy,
    actorName: uploadedByName,
    description: `Document uploaded: ${originalFilename}`,
    metadata: { filename, originalFilename, fileSize },
  });

  emitEvent("documentUploaded", {
    referralId: referralId.toString(),
    documentId: doc._id,
    filename: originalFilename,
  });

  emitEvent("timelineUpdated", {
    referralId: referralId.toString(),
    event: {
      eventType: "DOCUMENT_UPLOADED",
      description: `Document uploaded: ${originalFilename}`,
    },
  });

  return doc;
}

async function deleteDocument(documentId, referralId, performedBy, performedByName) {
  const doc = await ReferralDocument.findById(documentId);

  if (!doc) {
    throw new Error("Document not found");
  }

  const patientId = doc.referralId.toString();

  try {
    await fetch(`${AI_API}/documents/${encodeURIComponent(patientId)}/${encodeURIComponent(doc.filename)}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("[referralDocument] AI delete failed:", error?.message || error);
  }

  await ReferralDocument.deleteOne({ _id: documentId });

  await recordTimelineEvent({
    referralId,
    eventType: "DOCUMENT_DELETED",
    actorId: performedBy,
    actorName: performedByName,
    description: `Document deleted: ${doc.originalFilename}`,
    metadata: { filename: doc.filename, originalFilename: doc.originalFilename },
  });

  emitEvent("documentDeleted", {
    referralId: referralId.toString(),
    documentId: doc._id,
    filename: doc.originalFilename,
  });

  emitEvent("timelineUpdated", {
    referralId: referralId.toString(),
    event: {
      eventType: "DOCUMENT_DELETED",
      description: `Document deleted: ${doc.originalFilename}`,
    },
  });
}

async function replaceDocument(documentId, referralId, newFileData, newOriginalFilename, performedBy, performedByName) {
  const doc = await ReferralDocument.findById(documentId);

  if (!doc) {
    throw new Error("Document not found");
  }

  const patientId = doc.referralId.toString();
  const oldFilename = doc.filename;
  const oldOriginalFilename = doc.originalFilename;

  try {
    await fetch(`${AI_API}/documents/${encodeURIComponent(patientId)}/${encodeURIComponent(oldFilename)}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("[referralDocument] AI delete old on replace failed:", error?.message || error);
  }

  const newFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;

  doc.filename = newFilename;
  doc.originalFilename = newOriginalFilename;
  doc.fileSize = newFileData.length;
  doc.fileData = newFileData;
  doc.chunkCount = 0;
  await doc.save();

  const formData = new FormData();
  const blob = new Blob([newFileData], { type: "application/pdf" });
  formData.append("file", blob, newOriginalFilename);
  formData.append("patient_id", patientId);
  formData.append("uploaded_by", performedBy?.toString() || "");

  try {
    const response = await fetch(`${AI_API}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success && typeof result.data?.chunks_stored === "number") {
      doc.chunkCount = result.data.chunks_stored;
      await doc.save();
    }
  } catch (error) {
    console.error("[referralDocument] AI re-upload on replace failed:", error?.message || error);
  }

  await recordTimelineEvent({
    referralId,
    eventType: "DOCUMENT_REPLACED",
    actorId: performedBy,
    actorName: performedByName,
    description: `Document replaced: ${oldOriginalFilename} \u2192 ${newOriginalFilename}`,
    metadata: { oldFilename, newFilename, oldOriginalFilename, newOriginalFilename },
  });

  emitEvent("documentReplaced", {
    referralId: referralId.toString(),
    documentId: doc._id,
    filename: newOriginalFilename,
  });

  emitEvent("timelineUpdated", {
    referralId: referralId.toString(),
    event: {
      eventType: "DOCUMENT_REPLACED",
      description: `Document replaced: ${oldOriginalFilename} \u2192 ${newOriginalFilename}`,
    },
  });

  return doc;
}

module.exports = {
  getDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
  replaceDocument,
};
