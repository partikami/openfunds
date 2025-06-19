import path from "path";
// import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import { readFile, writeFile, set_fs } from "xlsx";
import * as fs from "fs";

set_fs(fs); // Set the fs module for XLSX

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer with storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads");
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

// Create middleware for file upload
const uploadMiddleware = upload.single("file");

// Upload an image file with error handling
export const uploadImageFile = (req, res) => {
  uploadMiddleware(req, res, function (err) {
    if (err) {
      console.error("Error during image upload:", err);
      // A Multer error occurred when uploading
      return res.status(err instanceof multer.MulterError ? 400 : 500).json({
        message: "File upload error",
        error: err.message,
      });
    }

    // File upload successful
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  });
};

// Upload a CSV file
export const uploadCSVFile = (req, res) => {
  uploadMiddleware(req, res, function (err) {
    if (err) {
      console.error("Error during CSV file upload:", err);
      return res.status(err instanceof multer.MulterError ? 400 : 500).json({
        message: "CSV file upload error",
        error: err.message,
      });
    }

    if (
      !req.file ||
      path.extname(req.file.originalname).toLowerCase() !== ".csv"
    ) {
      return res
        .status(400)
        .json({ message: "Please upload a valid CSV file" });
    }

    // Parse the CSV file
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        res.status(200).json({
          message: "CSV file uploaded and parsed successfully",
          data: results,
        });
      })
      .on("error", (error) => {
        console.error("Error parsing CSV file:", error);
        res.status(500).json({ message: "Error parsing CSV file", error });
      });
  });
};

// Upload an XLSX file
export const uploadXLSXFile = (req, res) => {
  uploadMiddleware(req, res, function (err) {
    if (err) {
      console.error("Error during XLSX file upload:", err);
      return res.status(err instanceof multer.MulterError ? 400 : 500).json({
        message: "XLSX file upload error",
        error: err.message,
      });
    }

    if (
      !req.file ||
      path.extname(req.file.originalname).toLowerCase() !== ".xlsx"
    ) {
      return res
        .status(400)
        .json({ message: "Please upload a valid XLSX file" });
    }

    try {
      const filePath = path.join(__dirname, "../../uploads", req.file.filename);
      console.log("Resolved file path:", filePath);
      if (!fs.existsSync(filePath)) {
        throw new Error("File not found: " + filePath);
      }

      const workbook = XLSX.readFile(filePath, {
        cellDates: true,
        cellText: false,
      });

      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      res.status(200).json({
        message: "XLSX file uploaded and parsed successfully",
        data: data,
      });
    } catch (error) {
      console.error("Error parsing XLSX file:", error);
      res.status(500).json({ message: "Error parsing XLSX file", error });
    }
  });
};

// Get a file
export const getFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../../uploads", filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "File not found" });
    }
    res.sendFile(filePath);
  });
};

// Delete a file
export const deleteFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../../uploads", filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res
        .status(404)
        .json({ message: "File not found or already deleted" });
    }
    res.json({ message: "File deleted successfully" });
  });
};
