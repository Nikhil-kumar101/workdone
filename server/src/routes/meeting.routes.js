const express = require("express");

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

const authenticate =
  require("../middleware/auth.middleware");

// ==========================================
// HOST AUTHORIZATION
// ==========================================

const {
  requireMeetingHost,
} = require("../middleware/meeting.middleware");

// ==========================================
// MEETING CONTROLLER
// ==========================================

const {
  createMeeting,
  getMeeting,
} = require("../controllers/meeting.controller");

// ==========================================
// MODERATION CONTROLLER
// ==========================================

const moderationController =
  require("../controllers/meeting.moderation.controller");

// ==========================================
// CREATE MEETING
// ==========================================

router.post(
  "/",
  authenticate,
  createMeeting
);

// ==========================================
// GET MEETING
// ==========================================

router.get(
  "/:roomId",
  authenticate,
  getMeeting
);

// ==========================================
// LOCK / UNLOCK MEETING
// ==========================================

router.patch(
  "/:roomId/lock",
  authenticate,
  requireMeetingHost,
  moderationController.lockMeeting
);

// ==========================================
// MEETING SETTINGS
// ==========================================

router.patch(
  "/:roomId/settings",
  authenticate,
  requireMeetingHost,
  moderationController.updateMeetingSettings
);

// ==========================================
// ASSIGN CO-HOST
// ==========================================

router.post(
  "/:roomId/co-host",
  authenticate,
  requireMeetingHost,
  moderationController.assignCoHost
);

// ==========================================
// REMOVE CO-HOST
// ==========================================

router.delete(
  "/:roomId/co-host/:userId",
  authenticate,
  requireMeetingHost,
  moderationController.removeCoHost
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;