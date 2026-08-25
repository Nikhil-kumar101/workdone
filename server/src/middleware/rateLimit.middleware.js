const rateLimit =
  require("express-rate-limit");


// ==========================================
// GENERAL API LIMIT
// ==========================================

const apiLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 300,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests. Please try again later.",
    },
  });


// ==========================================
// AUTH LIMIT
// ==========================================

const authLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many authentication attempts. Please try again later.",
    },
  });


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  apiLimiter,
  authLimiter,
};