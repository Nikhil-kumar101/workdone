const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDatabase =
  require("./config/database");

// ==========================================
// LOAD ROUTES
// ==========================================

const authRoutesModule =
  require("./routes/auth.routes");

const meetingRoutesModule =
  require("./routes/meeting.routes");

const livekitRoutesModule =
  require("./routes/livekit.routes");

const fileRoutesModule =
  require("./routes/file.routes");


// ==========================================
// RATE LIMITING
// ==========================================

const {
  apiLimiter,
  authLimiter,
} = require("./middleware/rateLimit.middleware");


// ==========================================
// NORMALIZE ROUTE EXPORTS
// ==========================================

const authRoutes =
  authRoutesModule.router ||
  authRoutesModule.default ||
  authRoutesModule;

const meetingRoutes =
  meetingRoutesModule.router ||
  meetingRoutesModule.default ||
  meetingRoutesModule;

const livekitRoutes =
  livekitRoutesModule.router ||
  livekitRoutesModule.default ||
  livekitRoutesModule;

const fileRoutes =
  fileRoutesModule.router ||
  fileRoutesModule.default ||
  fileRoutesModule;


// ==========================================
// VALIDATE ROUTES
// ==========================================

console.log(
  "authRoutes:",
  typeof authRoutes
);

console.log(
  "meetingRoutes:",
  typeof meetingRoutes
);

console.log(
  "livekitRoutes:",
  typeof livekitRoutes
);

console.log(
  "fileRoutes:",
  typeof fileRoutes
);


// ==========================================
// APP
// ==========================================

const app = express();

const PORT =
  process.env.PORT || 5000;


// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

app.use(
  cors()
);

app.use(
  express.json()
);


// ==========================================
// RATE LIMITER
// ==========================================

app.use(
  "/api",
  apiLimiter
);


// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Video Meeting API is running",
    });
  }
);


// ==========================================
// API TEST
// ==========================================

app.get(
  "/api/test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Backend and database server are running",
    });
  }
);


// ==========================================
// API ROUTES
// ==========================================

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use(
  "/api/meetings",
  meetingRoutes
);

app.use(
  "/api/livekit",
  livekitRoutes
);

app.use(
  "/api/files",
  fileRoutes
);


// ==========================================
// 404 HANDLER
// ==========================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "GLOBAL ERROR:",
      error
    );

    res.status(
      error.status || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
);


// ==========================================
// START SERVER
// ==========================================

const startServer =
  async () => {
    try {

      await connectDatabase();

      app.listen(
        PORT,
        () => {
          console.log(
            `Server running on http://localhost:${PORT}`
          );
        }
      );

    } catch (error) {

      console.error(
        "SERVER START ERROR:",
        error
      );

      process.exit(1);
    }
  };


startServer();