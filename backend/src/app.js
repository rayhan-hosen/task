const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (cPanel proxy)
app.set("trust proxy", 1);

// ---------------------------
// Allowed frontend origins
// ---------------------------
const allowedOrigins = [
  "https://rtpm.site",
  "http://localhost:5173",
  /\.vercel\.app$/,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow Postman, server-side
      if (allowedOrigins.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin))) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked from origin: " + origin));
    },
    credentials: true,
  })
);

// ---------------------------
// Helmet Security
// ---------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: [
          "'self'",
          "https://rtpm.site",
          "https://appifylab-project-nine.vercel.app",
          "https://*.vercel.app",
        ],
      },
    },
  })
);

// ---------------------------
// Rate Limiting
// ---------------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login/register attempts",
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------------
// Middleware
// ---------------------------
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ---------------------------
// Rate limiting Apply
// ---------------------------
app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ---------------------------
// Routes
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Buddy Script API is running");
});

// ---------------------------
// Start Server
// ---------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
