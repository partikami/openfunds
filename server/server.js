import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";

import connectDB from "./db/connectDB.js";
import recordRoutes from "./routes/record.route.js";
import authRoutes from "./routes/auth.route.js";
import fileRoutes from "./routes/file.route.js";

const PORT = process.env.PORT || 5050;
const app = express();

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads/");
console.log(`uploadsDir: ${uploadsDir}`);

app.use(
  cors({
    origin: [
      "https://of-client-c901ce91e892.herokuapp.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json()); // for parsing incoming JSON requests: req.body
app.use(cookieParser()); // for parsing incoming cookies

app.use("/record", recordRoutes);
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);

app.use(express.static("public")); // serve static files from the public directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // serve static files from the uploads directory

// start the Express server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server listening on port ${PORT}`);
});
