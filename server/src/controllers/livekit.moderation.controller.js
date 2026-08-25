const {
  listParticipants,
  muteParticipant: muteTrack,
  removeParticipant: removeLiveKitParticipant,
} = require(
  "../services/livekit.service"
);


// ==========================================
// MUTE PARTICIPANT
// ==========================================

const muteParticipant =
  async (req, res) => {
    try {
      const {
        roomId,
      } = req.params;

      const {
        identity,
        trackSid,
      } = req.body;

      if (!identity) {
        return res.status(400).json({
          success: false,
          message:
            "Participant identity is required",
        });
      }

      if (!trackSid) {
        return res.status(400).json({
          success: false,
          message:
            "Track SID is required",
        });
      }

      await muteTrack(
        roomId,
        identity,
        trackSid,
        true
      );

      return res.json({
        success: true,
        message:
          "Participant muted",
      });

    } catch (error) {
      console.error(
        "MUTE PARTICIPANT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mute participant",
      });
    }
  };


// ==========================================
// REMOVE PARTICIPANT
// ==========================================

const removeParticipant =
  async (req, res) => {
    try {
      const {
        roomId,
      } = req.params;

      const {
        identity,
      } = req.body;

      if (!identity) {
        return res.status(400).json({
          success: false,
          message:
            "Participant identity is required",
        });
      }

      await removeLiveKitParticipant(
        roomId,
        identity
      );

      return res.json({
        success: true,
        message:
          "Participant removed",
      });

    } catch (error) {
      console.error(
        "REMOVE PARTICIPANT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to remove participant",
      });
    }
  };


module.exports = {
  muteParticipant,
  removeParticipant,
};