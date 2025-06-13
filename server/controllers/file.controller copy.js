const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Upload a file
exports.uploadFile = [
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.status(201).json({
      filename: req.file.filename,
      originalname: req.file.originalname,
    });
  },
];

// Get a file
exports.getFile = (req, res) => {
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
exports.deleteFile = (req, res) => {
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
