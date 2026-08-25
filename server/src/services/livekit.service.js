const {
  RoomServiceClient,
} = require("livekit-server-sdk");


// ==========================================
// LIVEKIT CONFIG
// ==========================================

const apiKey =
  process.env.LIVEKIT_API_KEY;

const apiSecret =
  process.env.LIVEKIT_API_SECRET;

const livekitHost =
  process.env.LIVEKIT_URL;


// ==========================================
// VALIDATE CONFIG
// ==========================================

if (
  !apiKey ||
  !apiSecret ||
  !livekitHost
) {
  throw new Error(
    "LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be configured"
  );
}


// ==========================================
// ROOM SERVICE CLIENT
// ==========================================

const roomService =
  new RoomServiceClient(
    livekitHost,
    apiKey,
    apiSecret
  );


// ==========================================
// LIST PARTICIPANTS
// ==========================================

const listParticipants =
  async (roomName) => {
    return roomService.listParticipants(
      roomName
    );
  };


// ==========================================
// GET PARTICIPANT
// ==========================================

const getParticipant =
  async (
    roomName,
    identity
  ) => {
    return roomService.getParticipant(
      roomName,
      identity
    );
  };


// ==========================================
// REMOVE PARTICIPANT
// ==========================================

const removeParticipant =
  async (
    roomName,
    identity
  ) => {
    return roomService.removeParticipant(
      roomName,
      identity
    );
  };


// ==========================================
// MUTE PARTICIPANT
// ==========================================

const muteParticipant =
  async (
    roomName,
    identity,
    trackSid,
    muted = true
  ) => {
    return roomService.mutePublishedTrack(
      roomName,
      identity,
      trackSid,
      muted
    );
  };


// ==========================================
// UNMUTE PARTICIPANT
// ==========================================

const unmuteParticipant =
  async (
    roomName,
    identity,
    trackSid
  ) => {
    return roomService.mutePublishedTrack(
      roomName,
      identity,
      trackSid,
      false
    );
  };


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  roomService,
  listParticipants,
  getParticipant,
  removeParticipant,
  muteParticipant,
  unmuteParticipant,
};