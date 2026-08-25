const mongoose = require("mongoose");

const recordingSchema =
  new mongoose.Schema(
    {
      meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting",
        required: true,
        index: true,
      },

      roomId: {
        type: String,
        required: true,
        index: true,
      },

      hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      egressId: {
        type: String,
        required: true,
        unique: true,
      },

      status: {
        type: String,
        enum: [
          "starting",
          "recording",
          "processing",
          "completed",
          "failed",
        ],
        default: "starting",
      },

      fileName: {
        type: String,
        default: null,
      },

      storagePath: {
        type: String,
        default: null,
      },

      playbackUrl: {
        type: String,
        default: null,
      },

      durationSeconds: {
        type: Number,
        default: null,
      },

      startedAt: {
        type: Date,
        default: Date.now,
      },

      endedAt: {
        type: Date,
        default: null,
      },

      sizeBytes: {
        type: Number,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Recording",
    recordingSchema
  );