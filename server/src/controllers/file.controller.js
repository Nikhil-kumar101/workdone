const cloudinary =
  require("../config/cloudinary");

const File =
  require("../models/file");

const Meeting =
  require("../models/Meeting");

const {
  listParticipants,
} = require("../services/livekit.service");
// ==========================================
// UPLOAD FILE
// ==========================================

const uploadFile = async (
  req,
  res
) => {
  try {

    // ----------------------------------------
    // AUTHENTICATION
    // ----------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }


    // ----------------------------------------
    // CHECK FILE
    // ----------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No file was uploaded",
      });
    }


    // ----------------------------------------
    // GET ROOM ID
    // ----------------------------------------

    const {
      roomId,
    } = req.body;


    if (
      !roomId ||
      typeof roomId !== "string" ||
      !roomId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "roomId is required",
      });
    }


    const cleanRoomId =
      roomId.trim();


    // ----------------------------------------
    // FIND MEETING
    // ----------------------------------------

    const meeting =
      await Meeting.findOne({
        roomId: cleanRoomId,
      });


    if (!meeting) {
      return res.status(404).json({
        success: false,
        message:
          "Meeting not found",
      });
    }


    // ----------------------------------------
    // UPLOAD TO CLOUDINARY
    // ----------------------------------------

    const uploadResult =
      await new Promise(
        (resolve, reject) => {

          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                resource_type:
                  "auto",

                folder:
                  "video-meeting-platform/files",

                use_filename:
                  true,

                unique_filename:
                  true,
              },

              (
                error,
                result
              ) => {

                if (error) {
                  reject(error);
                  return;
                }

                resolve(result);
              }
            );


          uploadStream.end(
            req.file.buffer
          );
        }
      );


    // ----------------------------------------
    // VERIFY CLOUDINARY RESULT
    // ----------------------------------------

    if (
      !uploadResult ||
      !uploadResult.secure_url ||
      !uploadResult.public_id
    ) {
      return res.status(500).json({
        success: false,
        message:
          "File upload failed",
      });
    }


    // ----------------------------------------
    // SAVE METADATA TO MONGODB
    // ----------------------------------------

    const file =
      await File.create({
        meeting:
          meeting._id,

        roomId:
          meeting.roomId,

        uploadedBy:
          req.user._id,

        originalName:
          req.file.originalname,

        cloudinaryPublicId:
          uploadResult.public_id,

        url:
          uploadResult.secure_url,

        resourceType:
          uploadResult.resource_type ||
          "auto",

        mimeType:
          req.file.mimetype ||
          "application/octet-stream",

        sizeBytes:
          req.file.size ||
          0,
      });


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "File uploaded successfully",

      file: {
        id:
          file._id,

        meeting:
          file.meeting,

        roomId:
          file.roomId,

        uploadedBy:
          file.uploadedBy,

        name:
          file.originalName,

        url:
          file.url,

        publicId:
          file.cloudinaryPublicId,

        type:
          file.mimeType,

        size:
          file.sizeBytes,

        createdAt:
          file.createdAt,
      },
    });

  } catch (error) {

    console.error(
      "FILE UPLOAD ERROR:"
    );

    console.error(
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Could not upload file",
    });
  }
};


// ==========================================
// GET MEETING FILES
// ==========================================
// ==========================================
// GET MEETING FILES
// ==========================================

const getMeetingFiles = async (
  req,
  res
) => {
  try {

    // ----------------------------------------
    // AUTHENTICATION
    // ----------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }


    // ----------------------------------------
    // GET ROOM ID
    // ----------------------------------------

    const {
      roomId,
    } = req.params;


    if (
      !roomId ||
      typeof roomId !== "string" ||
      !roomId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "roomId is required",
      });
    }


    const cleanRoomId =
      roomId.trim();


    // ----------------------------------------
    // FIND MEETING
    // ----------------------------------------

    const meeting =
      await Meeting.findOne({
        roomId: cleanRoomId,
      });


    if (!meeting) {
      return res.status(404).json({
        success: false,
        message:
          "Meeting not found",
      });
    }


    // ----------------------------------------
    // GET CURRENT USER ID
    // ----------------------------------------

    const userId =
      req.user._id.toString();


    // ----------------------------------------
    // CHECK IF HOST
    // ----------------------------------------

    const isHost =
      meeting.hostId.toString() ===
      userId;


    // ----------------------------------------
    // HOST CAN ACCESS FILES
    // ----------------------------------------

    if (!isHost) {

      // --------------------------------------
      // GET LIVEKIT PARTICIPANTS
      // --------------------------------------

      const participants =
        await listParticipants(
          cleanRoomId
        );


      // --------------------------------------
      // CHECK ACTIVE PARTICIPANT
      // --------------------------------------

      const isParticipant =
        participants.some(
          (participant) =>
            participant.identity ===
            userId
        );


      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a participant in this meeting",
        });
      }
    }


    // ----------------------------------------
    // GET FILES
    // ----------------------------------------

    const files =
      await File.find({
        meeting:
          meeting._id,
      })
        .populate(
          "uploadedBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    return res.json({
      success: true,
      files,
    });

  } catch (error) {

    console.error(
      "GET MEETING FILES ERROR:"
    );

    console.error(
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not get meeting files",
    });
  }
};

// ==========================================
// DELETE FILE
// ==========================================

const deleteFile =
  async (
    req,
    res
  ) => {

    try {

      // --------------------------------------
      // AUTHENTICATION
      // --------------------------------------

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }


      // --------------------------------------
      // FILE ID
      // --------------------------------------

      const {
        fileId,
      } = req.params;


      if (!fileId) {
        return res.status(400).json({
          success: false,
          message:
            "fileId is required",
        });
      }


      // --------------------------------------
      // FIND FILE
      // --------------------------------------

      const file =
        await File.findById(
          fileId
        );


      if (!file) {
        return res.status(404).json({
          success: false,
          message:
            "File not found",
        });
      }


      // --------------------------------------
      // FIND MEETING
      // --------------------------------------

      const meeting =
        await Meeting.findById(
          file.meeting
        );


      if (!meeting) {
        return res.status(404).json({
          success: false,
          message:
            "Meeting not found",
        });
      }


      // --------------------------------------
      // CHECK PERMISSION
      // --------------------------------------

      const isUploader =
        file.uploadedBy
          .toString() ===
        req.user._id
          .toString();


      const isHost =
        meeting.hostId
          .toString() ===
        req.user._id
          .toString();


      if (
        !isUploader &&
        !isHost
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to delete this file",
        });
      }


      // --------------------------------------
      // DELETE FROM CLOUDINARY
      // --------------------------------------

      let cloudinaryResourceType =
        "raw";


      if (
        file.resourceType ===
        "image"
      ) {
        cloudinaryResourceType =
          "image";
      } else if (
        file.resourceType ===
        "video"
      ) {
        cloudinaryResourceType =
          "video";
      }


      await cloudinary.uploader.destroy(
        file.cloudinaryPublicId,
        {
          resource_type:
            cloudinaryResourceType,
        }
      );


      // --------------------------------------
      // DELETE FROM MONGODB
      // --------------------------------------

      await File.findByIdAndDelete(
        fileId
      );


      // --------------------------------------
      // RESPONSE
      // --------------------------------------

      return res.json({
        success: true,

        message:
          "File deleted successfully",
      });

    } catch (error) {

      console.error(
        "DELETE FILE ERROR:"
      );

      console.error(
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Could not delete file",
      });
    }
  };


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  uploadFile,
  getMeetingFiles,
  deleteFile,
};