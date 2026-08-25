const mongoose = require("mongoose");

const lockMeeting = async (req, res) => {
  try {
    const meeting = req.meeting;

    meeting.isLocked = !meeting.isLocked;

    await meeting.save();

    res.json({
      success: true,
      message: meeting.isLocked
        ? "Meeting locked"
        : "Meeting unlocked",
      meeting: {
        roomId: meeting.roomId,
        isLocked: meeting.isLocked,
      },
    });
  } catch (error) {
    console.error("LOCK ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update meeting lock",
    });
  }
};

const updateMeetingSettings = async (req, res) => {
  try {
    const meeting = req.meeting;

    const {
      maxParticipants,
      chatEnabled,
      screenShareEnabled,
    } = req.body;

    if (maxParticipants !== undefined) {
      const max = Number(maxParticipants);

      if (
        !Number.isInteger(max) ||
        max < 1 ||
        max > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum participants must be between 1 and 100",
        });
      }

      meeting.maxParticipants = max;
    }

    if (chatEnabled !== undefined) {
      meeting.chatEnabled = Boolean(chatEnabled);
    }

    if (screenShareEnabled !== undefined) {
      meeting.screenShareEnabled =
        Boolean(screenShareEnabled);
    }

    await meeting.save();

    res.json({
      success: true,
      message: "Meeting settings updated",
      meeting,
    });
  } catch (error) {
    console.error("SETTINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update meeting settings",
    });
  }
};

const assignCoHost = async (req, res) => {
  try {
    const meeting = req.meeting;
    const { userId } = req.body;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required",
      });
    }

    if (!Array.isArray(meeting.coHosts)) {
      meeting.coHosts = [];
    }

    if (meeting.hostId?.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Host is already the host",
      });
    }

    const alreadyCoHost = meeting.coHosts.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyCoHost) {
      return res.status(400).json({
        success: false,
        message: "User is already a co-host",
      });
    }

    meeting.coHosts.push(userId);

    await meeting.save();

    res.json({
      success: true,
      message: "Co-host assigned",
      coHosts: meeting.coHosts,
    });
  } catch (error) {
    console.error("CO-HOST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to assign co-host",
    });
  }
};

const removeCoHost = async (req, res) => {
  try {
    const meeting = req.meeting;
    const { userId } = req.params;

    if (!Array.isArray(meeting.coHosts)) {
      meeting.coHosts = [];
    }

    meeting.coHosts = meeting.coHosts.filter(
      (id) => id.toString() !== userId.toString()
    );

    await meeting.save();

    res.json({
      success: true,
      message: "Co-host removed",
      coHosts: meeting.coHosts,
    });
  } catch (error) {
    console.error("REMOVE CO-HOST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove co-host",
    });
  }
};

module.exports = {
  lockMeeting,
  updateMeetingSettings,
  assignCoHost,
  removeCoHost,
};