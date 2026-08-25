const express = require("express");

const router = express.Router();

const {
  AccessToken,
} = require("livekit-server-sdk");

const authenticate =
  require("../middleware/auth.middleware");

const Meeting =
  require("../models/Meeting");


// ==========================================
// CREATE LIVEKIT TOKEN
// ==========================================

router.post(
  "/:roomId/token",
  authenticate,
  async (req, res) => {
    try {
      const {
        roomId,
      } = req.params;

      // --------------------------------------
      // CHECK ENVIRONMENT
      // --------------------------------------

      const apiKey =
        process.env.LIVEKIT_API_KEY;

      const apiSecret =
        process.env.LIVEKIT_API_SECRET;

      const livekitUrl =
        process.env.LIVEKIT_URL;

      if (
        !apiKey ||
        !apiSecret ||
        !livekitUrl
      ) {
        console.error(
          "Missing LiveKit environment variables"
        );

        return res.status(500).json({
          success: false,
          message:
            "LiveKit server configuration is missing",
        });
      }


      // --------------------------------------
      // FIND MEETING
      // --------------------------------------

      const meeting =
        await Meeting.findOne({
          roomId,
        });

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message:
            "Meeting not found",
        });
      }


      // --------------------------------------
      // CHECK LOCK
      // --------------------------------------

      if (
        meeting.isLocked &&
        meeting.hostId.toString() !==
          req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Meeting is locked",
        });
      }


      // --------------------------------------
      // PARTICIPANT IDENTITY
      // --------------------------------------

      const identity =
        req.user._id.toString();

      const participantName =
        req.user.name ||
        req.user.email ||
        identity;


      // --------------------------------------
      // CREATE ACCESS TOKEN
      // --------------------------------------

      const accessToken =
        new AccessToken(
          apiKey,
          apiSecret,
          {
            identity,
            name: participantName,
            ttl: "2h",
          }
        );


      // --------------------------------------
      // ROOM PERMISSIONS
      // --------------------------------------

      accessToken.addGrant({
        roomJoin: true,
        room: roomId,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canUpdateOwnMetadata: true,
      });


      // --------------------------------------
      // GENERATE JWT
      // --------------------------------------

      const token =
        await accessToken.toJwt();


      console.log(
        "LiveKit token created for:",
        participantName
      );

      console.log(
        "Room:",
        roomId
      );


      // --------------------------------------
      // RESPONSE
      // --------------------------------------

      return res.json({
        success: true,

        token,

        url:
          livekitUrl,

        roomId,

        participant: {
          identity,
          name:
            participantName,
        },
      });

    } catch (error) {
      console.error(
        "CREATE LIVEKIT TOKEN ERROR:"
      );

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Could not create LiveKit token",
      });
    }
  }
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;