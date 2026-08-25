const Meeting = require("../models/Meeting");


// ==========================================
// LOAD MEETING
// ==========================================

const loadMeeting = async (
  req,
  res,
  next
) => {
  try {
    const {
      roomId,
    } = req.params;


    // ----------------------------------------
    // ROOM ID TYPE CHECK
    // ----------------------------------------

    if (
      typeof roomId !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "roomId must be a string",
      });
    }


    // ----------------------------------------
    // CLEAN ROOM ID
    // ----------------------------------------

    const cleanRoomId =
      roomId.trim();


    // ----------------------------------------
    // REQUIRED CHECK
    // ----------------------------------------

    if (!cleanRoomId) {
      return res.status(400).json({
        success: false,
        message:
          "roomId is required",
      });
    }


    // ----------------------------------------
    // LENGTH CHECK
    // ----------------------------------------

    if (
      cleanRoomId.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "roomId is too long",
      });
    }


    // ----------------------------------------
    // BASIC CHARACTER CHECK
    // ----------------------------------------
    // Allow letters, numbers,
    // hyphen and underscore.
    //
    // This should be compatible with
    // common generated room IDs.

    if (
      !/^[a-zA-Z0-9_-]+$/.test(
        cleanRoomId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid roomId format",
      });
    }


    // ----------------------------------------
    // FIND MEETING
    // ----------------------------------------

    const meeting =
      await Meeting.findOne({
        roomId:
          cleanRoomId,
      });


    // ----------------------------------------
    // MEETING NOT FOUND
    // ----------------------------------------

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message:
          "Meeting not found",
      });
    }


    // ----------------------------------------
    // ATTACH CLEAN ROOM ID
    // ----------------------------------------

    req.roomId =
      cleanRoomId;


    // ----------------------------------------
    // ATTACH MEETING
    // ----------------------------------------

    req.meeting =
      meeting;


    // ----------------------------------------
    // CONTINUE
    // ----------------------------------------

    next();

  } catch (error) {

    console.error(
      "LOAD MEETING ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not load meeting",
    });
  }
};


// ==========================================
// REQUIRE MEETING HOST
// ==========================================

const requireMeetingHost = (
  req,
  res,
  next
) => {
  try {

    // ----------------------------------------
    // AUTHENTICATION CHECK
    // ----------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }


    // ----------------------------------------
    // CHECK MEETING
    // ----------------------------------------

    const meeting =
      req.meeting;

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message:
          "Meeting not found",
      });
    }


    // ----------------------------------------
    // GET USER ID
    // ----------------------------------------

    const currentUserId =
      req.user._id?.toString();


    // ----------------------------------------
    // GET HOST ID
    // ----------------------------------------

    const meetingHostId =
      meeting.hostId?.toString();


    // ----------------------------------------
    // VALIDATE IDS
    // ----------------------------------------

    if (
      !currentUserId ||
      !meetingHostId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Meeting host information is invalid",
      });
    }


    // ----------------------------------------
    // HOST AUTHORIZATION
    // ----------------------------------------

    if (
      currentUserId !==
      meetingHostId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the meeting host can perform this action",
      });
    }


    // ----------------------------------------
    // AUTHORIZED
    // ----------------------------------------

    next();

  } catch (error) {

    console.error(
      "MEETING HOST AUTHORIZATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to authorize meeting host",
    });
  }
};


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  loadMeeting,
  requireMeetingHost,
};