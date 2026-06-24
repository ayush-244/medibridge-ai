const TimelineEvent = require("../models/TimelineEvent");
const emitEvent = require("../services/socketEmitter.service");

async function recordTimelineEvent({
  referralId,
  eventType,
  actorId = null,
  actorName = "System",
  description,
  metadata = {},
}) {
  const event = await TimelineEvent.create({
    referralId,
    eventType,
    actorId,
    actorName,
    description,
    metadata,
  });

  emitEvent("timelineUpdated", {
    referralId: referralId.toString(),
    event: {
      _id: event._id,
      eventType: event.eventType,
      actorName: event.actorName,
      description: event.description,
      metadata: event.metadata,
      createdAt: event.createdAt,
    },
  });

  return event;
}

async function getTimelineEvents(referralId, limit = 50) {
  return TimelineEvent.find({ referralId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

module.exports = { recordTimelineEvent, getTimelineEvents };
