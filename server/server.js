import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";

import connectDB from "./db/connectDB.js";
import recordRoutes from "./routes/record.route.js";
import authRoutes from "./routes/auth.route.js";
import importRoutes from "./routes/import.route.js";
import exportRoutes from "./routes/export.route.js";

const PORT = process.env.PORT || 5050;
const app = express();

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get allowed origins from environment variable
// Remember to set this env var in your Portainer stack or docker-compose.yml
// Example: CORS_ALLOWED_ORIGINS=http://your-nas-ip,http://your-domain.com
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:3000", // For local dev of frontend
      "http://localhost:5173", // Vite's default dev port
      "http://dsm1.ipartin.com",
      "http://192.168.15.12",
      "http://client", // Internal Docker network name for the Nginx (client) container
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        callback(new Error(msg), false);
      }
    },
    credentials: true, // If you're using cookies or sessions
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], // Explicitly list allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Explicitly list allowed headers
    exposedHeaders: ["X-Exported-Count", "Content-Disposition"],
  })
);

app.use(express.json()); // for parsing incoming JSON requests: req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // for parsing incoming cookies

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK!!!" });
});

app.use("/api/record", recordRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/import", importRoutes);
app.use("/api/export", exportRoutes);

app.use(express.static("public")); // serve static files from the public directory
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads"))); // serve static files from the uploads directory

// start the Express server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on port ${PORT}`);
});
