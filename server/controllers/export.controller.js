import ExportDocument from "../models/record.model.js";
import semver from "semver";

const CURRENT_VERSION = [1, 2, 4, 100, null]; // Semantic version format: [major, minor, patch, build, pre-release]

// --- Endpoint to export documents based on filter and format ---
const exportFile = async (req, res) => {
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

  const { format, filterOption, filterVersion } = req.body; // version will be a string
  let query = {};
  console.log("Export format:", format);
  console.log("Filter option:", filterOption);
  console.log("Version filter:", filterVersion);

  // --- 1. Construct MongoDB Query based on filterOption and version ---
  switch (filterOption) {
    case "public":
      query.tags = { $ne: "Internal" }; // Exclude documents with "Internal" in tags array
      if (filterVersion !== null) {
        query.introduced = { $lte: filterVersion }; // Version mentioned or before
      } else {
        query.introduced = CURRENT_VERSION; // Default to latest public version if no version provided
      }
      break;
    case "all":
      // No specific 'Internal' filter needed for all documents
      if (filterVersion !== null) {
        query.introduced = { $lte: filterVersion }; // Version mentioned or before
      }
      break;
    case "nextVersions":
      if (filterVersion === null) {
        return res.status(400).json({
          message: 'Version number is required for "Next Versions" filter.',
        });
      }
      query.introduced = { $gt: filterVersion }; // Exclude documents with and before this version
      break;
    default:
      return res.status(400).json({ message: "Invalid filter option." });
  }

  let documents;
  try {
    console.log("MongoDB Query:", query);
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
};

export default exportFile;
