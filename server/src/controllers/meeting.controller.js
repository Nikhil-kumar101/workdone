const crypto = require("crypto");

const Meeting = require("../models/Meeting");


// ==========================================
// GENERATE ROOM ID
// ==========================================

const generateRoomId = () => {
  return crypto
    .randomBytes(6)
    .toString("hex");
};


// ==========================================
// CREATE MEETING
// ==========================================

const createMeeting = async (
  req,
  res
) => {
  try {
    console.log(
      "Create meeting request received"
    );

    console.log(
      "Authenticated user:",
      req.user
    );

    console.log(
      "Request body:",
      req.body
    );


    // ----------------------------------------
    // CHECK USER
    // ----------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }


    // ----------------------------------------
    // GET REQUEST DATA
    // ----------------------------------------

    const {
      title,
      maxParticipants,
    } = req.body;


    // ----------------------------------------
    // VALIDATE TITLE
    // ----------------------------------------

    if (
      !title ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Meeting title is required",
      });
    }


    // ----------------------------------------
    // VALIDATE PARTICIPANT LIMIT
    // ----------------------------------------

    const participants =
      Number(maxParticipants) || 10;

    if (
      participants < 1 ||
      participants > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum participants must be between 1 and 100",
      });
    }


    // ----------------------------------------
    // CREATE MEETING
    // ----------------------------------------

    const meeting =
      await Meeting.create({
        roomId:
          generateRoomId(),

        title:
          title.trim(),

        hostId:
          req.user._id,

        maxParticipants:
          participants,

        isLocked:
          false,

        chatEnabled:
          true,

        screenShareEnabled:
          true,

        coHosts:
          [],
      });


    console.log(
      "Meeting created:",
      meeting.roomId
    );


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Meeting created successfully",

      meeting: {
        id:
          meeting._id,

        roomId:
          meeting.roomId,

        title:
          meeting.title,

        hostId:
          meeting.hostId,

        maxParticipants:
          meeting.maxParticipants,

        isLocked:
          meeting.isLocked,

        chatEnabled:
          meeting.chatEnabled,

        screenShareEnabled:
          meeting.screenShareEnabled,

        coHosts:
          meeting.coHosts,

        status:
          meeting.status,
      },
    });

  } catch (error) {

    console.error(
      "CREATE MEETING ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Could not create meeting",
    });
  }
};


// ==========================================
// GET MEETING
// ==========================================

const getMeeting = async (
  req,
  res
) => {
  try {

    const {
      roomId,
    } = req.params;


    // ----------------------------------------
    // FIND MEETING
    // ----------------------------------------

    const meeting =
      await Meeting.findOne({
        roomId,
      }).populate(
        "hostId",
        "name email"
      );


    if (!meeting) {
      return res.status(404).json({
        success: false,
        message:
          "Meeting not found",
      });
    }


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.json({
      success: true,

      meeting: {
        id:
          meeting._id,

        roomId:
          meeting.roomId,

        title:
          meeting.title,

        hostId:
          meeting.hostId,

        maxParticipants:
          meeting.maxParticipants ??
          10,

        isLocked:
          meeting.isLocked ??
          false,

        chatEnabled:
          meeting.chatEnabled ??
          true,

        screenShareEnabled:
          meeting.screenShareEnabled ??
          true,

        coHosts:
          meeting.coHosts ??
          [],

        status:
          meeting.status,
      },
    });

  } catch (error) {

    console.error(
      "GET MEETING ERROR:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Could not get meeting",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createMeeting,
  getMeeting,
};