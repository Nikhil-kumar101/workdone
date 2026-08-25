const express =
  require("express");

const multer =
  require("multer");

const router =
  express.Router();

const authenticate =
  require("../middleware/auth.middleware");

const {
  uploadFile,
  getMeetingFiles,
} = require(
  "../controllers/file.controller"
);


// ==========================================
// MULTER
// ==========================================

const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },
  });


// ==========================================
// UPLOAD FILE
// ==========================================

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadFile
);


// ==========================================
// GET MEETING FILES
// ==========================================

router.get(
  "/meeting/:roomId",
  authenticate,
  getMeetingFiles
);


// ==========================================
// EXPORT
// ==========================================

module.exports =
  router;