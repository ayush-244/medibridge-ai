const CopilotAnalytics = require("../models/CopilotAnalytics");

async function trackCopilotEvent({
  userId,
  sessionId = null,
  patientId,
  eventType,
  diagnosis = "",
  specialist = "",
  confidence = 0,
  referralConverted = false,
  metadata = {},
}) {
  try {
    await CopilotAnalytics.create({
      userId,
      sessionId,
      patientId,
      eventType,
      diagnosis,
      specialist,
      confidence,
      referralConverted,
      metadata,
    });
  } catch (error) {
    console.error("Copilot Analytics Error:", error);
  }
}

async function getCopilotAnalyticsSummary() {
  const [
    totalSessions,
    totalQuestions,
    diagnosisAgg,
    specialistAgg,
    confidenceAgg,
    referralConversions,
  ] = await Promise.all([
    CopilotAnalytics.countDocuments({ eventType: "SESSION_STARTED" }),
    CopilotAnalytics.countDocuments({ eventType: "QUESTION_ASKED" }),
    CopilotAnalytics.aggregate([
      { $match: { diagnosis: { $ne: "" } } },
      { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    CopilotAnalytics.aggregate([
      { $match: { specialist: { $ne: "" } } },
      { $group: { _id: "$specialist", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    CopilotAnalytics.aggregate([
      { $match: { eventType: "RESPONSE_GENERATED", confidence: { $gt: 0 } } },
      { $group: { _id: null, avgConfidence: { $avg: "$confidence" } } },
    ]),
    CopilotAnalytics.countDocuments({ referralConverted: true }),
  ]);

  return {
    totalSessions,
    totalQuestions,
    mostCommonDiagnoses: diagnosisAgg.map((item) => ({
      diagnosis: item._id,
      count: item.count,
    })),
    mostRecommendedSpecialists: specialistAgg.map((item) => ({
      specialist: item._id,
      count: item.count,
    })),
    averageConfidence: confidenceAgg[0]?.avgConfidence
      ? Math.round(confidenceAgg[0].avgConfidence)
      : 0,
    referralConversions,
  };
}

module.exports = {
  trackCopilotEvent,
  getCopilotAnalyticsSummary,
};
