import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import * as fs from "fs";

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  uploadImageFile,
  importJSONFile,
  importCSVFile,
  importXLSXFile,
} from "../controllers/import.controller.js";

const router = express.Router();

// Configure multer with storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Fix for const uploadDir as the uploads were stored in a non persistent folder within the container
    // const uploadDir = path.join(__dirname, "../../uploads");
    const uploadDir = "/app/uploads"; // Use the absolute path inside the container where the volume is mounted

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ofid = req.body.ofid || file.fieldname;
    // Get the current ISO date string, e.g., "2025-06-07T12:34:56.789Z"
    const isoString = new Date().toISOString();
    // Get the date portion and remove hyphens to form "20250607"
    const datePart = isoString.split("T")[0].replace(/-/g, "");
    // Split the time part to extract hours and minutes
    const timeParts = isoString.split("T")[1].split(":");
    const hours = timeParts[0]; // "12"
    const minutes = timeParts[1]; // "34"
    // Build the formatted time using "h" and "m"
    const formattedTime = `${hours}h${minutes}m`;
    const dateStr = `${datePart}T${formattedTime}`;
    // Create filename: OFID + '-' + dateStr + extension
    cb(null, `${ofid}-${dateStr}${path.extname(file.originalname)}`);
  },
});

// Configure multer with storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
});

router.post("/upload-image", upload.single("file"), uploadImageFile);
router.post("/import-json", upload.single("file"), importJSONFile);
router.post("/import-csv", upload.single("file"), importCSVFile);
router.post("/import-xlsx", upload.single("file"), importXLSXFile);

export default router;
