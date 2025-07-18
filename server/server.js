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

app.use(
  cors({
    origin: [
      "https://of-client-c901ce91e892.herokuapp.com",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://192.168.15.12:3000",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    exposedHeaders: ["X-Exported-Count", "Content-Disposition"],
    credentials: true,
  })
);

app.use(express.json()); // for parsing incoming JSON requests: req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // for parsing incoming cookies

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK!!!" });
});

app.use("/record", recordRoutes);
app.use("/auth", authRoutes);
app.use("/import", importRoutes);
app.use("/export", exportRoutes);

app.use(express.static("public")); // serve static files from the public directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // serve static files from the uploads directory

// start the Express server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on port ${PORT}`);
});
