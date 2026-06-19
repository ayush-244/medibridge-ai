const mongoose = require("mongoose");

const citationSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
  },
  { _id: false },
);

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      default: "",
    },

    evidence: {
      type: [String],
      default: [],
    },

    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    citations: {
      type: [citationSchema],
      default: [],
    },

    suggestedQuestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
