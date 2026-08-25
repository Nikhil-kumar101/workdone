const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");


// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

const authenticate =
  async (req, res, next) => {
    try {

      // --------------------------------------
      // CHECK AUTHORIZATION HEADER
      // --------------------------------------

      const header =
        req.headers.authorization;

      if (
        !header ||
        !header.startsWith("Bearer ")
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }


      // --------------------------------------
      // EXTRACT TOKEN
      // --------------------------------------

      const token =
        header
          .slice(7)
          .trim();

      if (!token) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }


      // --------------------------------------
      // VERIFY JWT
      // --------------------------------------

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET,
          {
            algorithms: ["HS256"],
          }
        );


      // --------------------------------------
      // VALIDATE PAYLOAD
      // --------------------------------------

      if (
        !decoded ||
        !decoded.id
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authentication token",
        });
      }


      // --------------------------------------
      // FIND USER
      // --------------------------------------

      const user =
        await User.findById(
          decoded.id
        );


      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "User not found",
        });
      }


      // --------------------------------------
      // ATTACH USER
      // --------------------------------------

      req.user =
        user;

      req.userId =
        user._id.toString();


      next();

    } catch (error) {

      console.error(
        "AUTHENTICATION ERROR:",
        error.message
      );


      // --------------------------------------
      // JWT ERRORS
      // --------------------------------------

      if (
        error.name ===
        "TokenExpiredError"
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication token expired",
        });
      }


      if (
        error.name ===
        "JsonWebTokenError"
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authentication token",
        });
      }


      return res.status(401).json({
        success: false,
        message:
          "Authentication failed",
      });
    }
  };


module.exports =
  authenticate;