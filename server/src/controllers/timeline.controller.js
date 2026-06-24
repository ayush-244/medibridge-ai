const { getTimelineEvents } = require("../services/timeline.service");

const getReferralTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Referral ID is required",
      });
    }

    const events = await getTimelineEvents(id);

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("[timeline] fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch timeline events",
    });
  }
};

module.exports = { getReferralTimeline };
