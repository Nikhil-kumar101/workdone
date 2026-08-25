const mongoose = require("mongoose");


// ==========================================
// MEETING SCHEMA
// ==========================================

const meetingSchema = new mongoose.Schema(
  {
    // ----------------------------------------
    // ROOM ID
    // ----------------------------------------

    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },


    // ----------------------------------------
    // TITLE
    // ----------------------------------------

    title: {
      type: String,
      required: true,
      trim: true,
    },


    // ----------------------------------------
    // HOST
    // ----------------------------------------

    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },


    // ----------------------------------------
    // PARTICIPANT LIMIT
    // ----------------------------------------

    maxParticipants: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    },


    // ----------------------------------------
    // MEETING STATUS
    // ----------------------------------------

    status: {
      type: String,
      enum: [
        "scheduled",
        "active",
        "ended",
      ],
      default: "scheduled",
    },


    // ----------------------------------------
    // LOCK
    // ----------------------------------------

    isLocked: {
      type: Boolean,
      default: false,
    },


    // ----------------------------------------
    // CHAT
    // ----------------------------------------

    chatEnabled: {
      type: Boolean,
      default: true,
    },


    // ----------------------------------------
    // SCREEN SHARE
    // ----------------------------------------

    screenShareEnabled: {
      type: Boolean,
      default: true,
    },


    // ----------------------------------------
    // CO-HOSTS
    // ----------------------------------------

    coHosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],


    // ----------------------------------------
    // RECORDING
    // ----------------------------------------

    recordingEnabled: {
      type: Boolean,
      default: true,
    },

    recordingStatus: {
      type: String,
      enum: [
        "idle",
        "recording",
        "processing",
        "completed",
        "failed",
      ],
      default: "idle",
    },

    activeRecordingId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// ==========================================
// MODEL
// ==========================================

module.exports =
  mongoose.model(
    "Meeting",
    meetingSchema
  );