const {
  EgressClient,
} = require("livekit-server-sdk");

const egressClient =
  new EgressClient(
    process.env.LIVEKIT_URL,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );


// ==========================================
// START ROOM RECORDING
// ==========================================

const startRoomRecording =
  async (roomId) => {
    const egress =
      await egressClient.startRoomCompositeEgress(
        roomId,
        {
          file: {
            // We are intentionally keeping
            // the first test focused on
            // Egress connectivity.
          },
        }
      );

    return egress;
  };


// ==========================================
// STOP RECORDING
// ==========================================

const stopRoomRecording =
  async (egressId) => {
    return egressClient.stopEgress(
      egressId
    );
  };


module.exports = {
  egressClient,
  startRoomRecording,
  stopRoomRecording,
};