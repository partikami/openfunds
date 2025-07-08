const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { stringify } = require("csv-stringify");
const XLSX = require("xlsx"); // Changed from ExcelJS
const PDFDocument = require("pdfkit");
const axios = require("axios"); // Added axios, though not strictly used for internal API calls here, for consistency

const app = express();
const port = 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MongoDB Connection ---
const mongoURI = "mongodb://localhost:27017/your_export_database"; // <<< CHANGE THIS
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- Mongoose Schema and Model ---
const ExportDocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  isInternal: { type: Boolean, default: false }, // true for internal documents
  version: { type: Number, required: true }, // e.g., 1.0, 1.1, 2.0
  // Add other fields relevant to your documents
});
const ExportDocument = mongoose.model(
  "ExportDocument",
  ExportDocumentSchema,
  "your_export_collection"
); // <<< CHANGE THIS

// --- Helper function to convert documents for export ---
const prepareDocumentsForExport = (docs) => {
  return docs.map((doc) => {
    const obj = doc.toObject();
    // Remove MongoDB's _id and __v if not needed in exports
    delete obj._id;
    delete obj.__v;
    return obj;
  });
};

// --- POST Endpoint for Export ---
app.post("/api/export-documents", async (req, res) => {
  const { format, filterOption, version } = req.body; // version will be a string
  let query = {};
  const parsedVersion = version ? parseFloat(version) : null;

  // --- 1. Construct MongoDB Query based on filterOption and version ---
  switch (filterOption) {
    case "public":
      query.isInternal = false;
      if (parsedVersion !== null) {
        query.version = { $lte: parsedVersion }; // Version mentioned or before
      }
      break;
    case "all":
      // No specific 'isInternal' filter needed for all documents
      if (parsedVersion !== null) {
        query.version = { $lte: parsedVersion }; // Version mentioned or before
      }
      break;
    case "nextVersions":
      if (parsedVersion === null) {
        return res
          .status(400)
          .json({
            message: 'Version number is required for "Next Versions" filter.',
          });
      }
      query.version = { $gt: parsedVersion }; // Exclude documents with and before this version
      break;
    default:
      return res.status(400).json({ message: "Invalid filter option." });
  }

  let documents;
  try {
    documents = await ExportDocument.find(query).lean(); // .lean() for plain JS objects
  } catch (error) {
    console.error("Error fetching documents from MongoDB:", error);
    return res
      .status(500)
      .json({ message: "Error fetching documents.", error: error.message });
  }

  if (!documents || documents.length === 0) {
    return res
      .status(404)
      .json({ message: "No documents found for the selected criteria." });
  }

  const exportableDocs = prepareDocumentsForExport(documents);

  // --- 2. Generate File based on format ---
  try {
    let filename = `documents_export_${filterOption}`;
    if (version) {
      filename += `_v${version.replace(/\./g, "_")}`; // Sanitize version for filename
    }

    switch (format) {
      case "json":
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.json"`
        );
        return res.send(JSON.stringify(exportableDocs, null, 2));

      case "csv":
        const columnsCSV = Object.keys(exportableDocs[0] || {}); // Use keys from the first doc
        stringify(
          exportableDocs,
          { header: true, columns: columnsCSV },
          (err, output) => {
            if (err) throw err;
            res.setHeader("Content-Type", "text/csv");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${filename}.csv"`
            );
            return res.send(output);
          }
        );
        break;

      case "xlsx":
        const ws = XLSX.utils.json_to_sheet(exportableDocs);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Documents");

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.xlsx"`
        );
        return res.send(buffer); // Send the buffer directly

      case "pdf":
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.pdf"`
        );

        doc.pipe(res);

        doc.fontSize(20).text("Document Export", { align: "center" });
        doc
          .fontSize(12)
          .text(`Filter: ${filterOption}, Version: ${version || "All"}`);
        doc.moveDown();

        exportableDocs.forEach((item, index) => {
          doc.fontSize(10).text(`--- Document ${index + 1} ---`);
          for (const key in item) {
            doc.text(`${key}: ${item[key]}`);
          }
          doc.moveDown();
        });

        doc.end();
        break;

      default:
        return res
          .status(400)
          .json({ message: "Invalid file format requested." });
    }
  } catch (error) {
    console.error("Error generating file:", error);
    res
      .status(500)
      .json({ message: "Error generating export file.", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
