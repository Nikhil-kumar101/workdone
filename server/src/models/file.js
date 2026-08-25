const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
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

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    cloudinaryPublicId: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    resourceType: {
      type: String,
      default: "auto",
    },

    mimeType: {
      type: String,
      default: "application/octet-stream",
    },

    sizeBytes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "File",
  fileSchema
);