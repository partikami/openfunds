import ExportDocument from "../models/record.model.js";
import { stringify } from "csv-stringify";
import XLSX from "xlsx"; // XLSX for Excel file generation
import PDFDocument from "pdfkit"; // PDFKit for PDF file generation

// const CURRENT_VERSION = [1, 2, 4]; // Semantic version format: [major, minor, patch, build, pre-release]

// --- Endpoint to export documents based on filter and format ---
const exportFile = async (req, res) => {
  // --- Helper function to convert documents for export ---
  const prepareDocumentsForExport = (docs) => {
    return docs.map((doc) => {
      const obj = { ...doc };
      // Remove MongoDB's _id and __v if not needed in exports
      delete obj._id;
      delete obj.__v;
      return obj;
    });
  };

  const { format, filterOption, filterVersion } = req.body; // version will be a string
  let query = {};

  // --- 1. Construct MongoDB Query based on filterOption and version ---
  switch (filterOption) {
    case "public":
      query.tags = { $ne: "Internal" }; // Exclude documents with "Internal" in tags array
      if (filterVersion !== null) {
        query.introduced = { $lte: filterVersion }; // Version mentioned or before
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
    documents = await ExportDocument.find(query).sort({ ofid: 1 }).lean(); // .lean() for plain JS objects
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
    let filename = "openfunds";
    if (filterVersion) {
      filename += `_v[${filterVersion.join(",")}]_${filterOption}`;
    } else {
      filename += `_allVersions_${filterOption}`;
    }

    switch (format) {
      case "json":
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.json"`
        );
        res.setHeader("X-Exported-Count", exportableDocs.length);
        return res.send(JSON.stringify(exportableDocs, null, 2));

      // Case for CSV export
      case "csv":
        if (!exportableDocs.length) {
          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}.csv"`
          );
          res.setHeader("X-Exported-Count", 0);
          return res.send(""); // or send a header row if you prefer
        }
        // Deep copy and flatten tags only for CSV
        const csvDocs = exportableDocs.map((doc) => ({
          ...doc,
          tags: Array.isArray(doc.tags)
            ? doc.tags.slice().sort().join("|")
            : doc.tags,
          introduced: Array.isArray(doc.introduced)
            ? `"${doc.introduced.join(".")}"`
            : typeof doc.introduced === "string"
            ? `"${doc.introduced}"`
            : doc.introduced,
          deprecated: Array.isArray(doc.deprecated)
            ? `"${doc.deprecated.join(".")}"`
            : typeof doc.deprecated === "string"
            ? `"${doc.deprecated}"`
            : doc.deprecated,
        }));
        //const columnsCSV = Object.keys(csvDocs[0] || {}); // Get keys from the first document for CSV columns
        // Define the order of columns explicitly for CSV export
        const columnsCSV = [
          "ofid",
          "fieldName",
          "dataType",
          "description",
          "values",
          "level",
          "tags",
          "example",
          "linkReference",
          "introduced",
          "deprecated",
          "uploadedFile",
        ];
        stringify(
          csvDocs,
          { header: true, columns: columnsCSV },
          (err, output) => {
            if (err) throw err;
            res.setHeader("Content-Type", "text/csv");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${filename}.csv"`
            );
            res.setHeader("X-Exported-Count", csvDocs.length);
            return res.send(output);
          }
        );
        break;

      // Case for XLSX export
      case "xlsx":
        // Define the order of columns explicitly for XLSX export
        const columnsXLSX = [
          "ofid",
          "fieldName",
          "dataType",
          "description",
          "values",
          "level",
          "tags",
          "example",
          "linkReference",
          "introduced",
          "deprecated",
          "uploadedFile",
        ];

        // Flatten and reorder for XLSX export
        const xlsxDocs = exportableDocs.map((doc) => {
          const flatDoc = {
            ...doc,
            tags: Array.isArray(doc.tags)
              ? doc.tags.slice().sort().join("|")
              : doc.tags,
            introduced: Array.isArray(doc.introduced)
              ? `'${doc.introduced.join(".")}`
              : typeof doc.introduced === "string"
              ? `'${doc.introduced}`
              : doc.introduced,
            deprecated: Array.isArray(doc.deprecated)
              ? `'${doc.deprecated.join(".")}`
              : typeof doc.deprecated === "string"
              ? `'${doc.deprecated}`
              : doc.deprecated,
          };
          // Reorder keys according to columnsXLSX
          const orderedDoc = {};
          columnsXLSX.forEach((key) => {
            orderedDoc[key] = flatDoc[key];
          });
          return orderedDoc;
        });

        const ws = XLSX.utils.json_to_sheet(xlsxDocs);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Fields");

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.xlsx"`
        );
        res.setHeader("X-Exported-Count", exportableDocs.length);
        return res.send(buffer); // Send the buffer directly

      // Case for PDF export
      case "pdf":
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.pdf"`
        );
        res.setHeader("X-Exported-Count", exportableDocs.length);

        doc.pipe(res);

        doc.fontSize(20).text("Openfunds Fields", { align: "center" });

        const filterLabel = `Filter: `.padEnd(20, ".");
        const versionLabel = `Version: `.padEnd(17, ".");

        doc.fontSize(12).text(`${filterLabel}${filterOption}`);
        doc.fontSize(12).text(`${versionLabel}${filterVersion || "All"}`);
        doc.moveDown(1);

        exportableDocs.forEach((item, index) => {
          const headerOfid = item.ofid || "";
          const headerFieldName = item.fieldName || "";
          const bodyDataType = item.dataType || "";
          const bodyDescription = item.description || "";
          const bodyValues =
            item.values && item.values.length ? item.values : "";
          const bodyLevel = item.level || "";
          const bodyTags = item.tags ? item.tags.join(", ") : "";
          const bodyExample = item.example || "";
          const bodyLinkReference = item.linkReference || "";
          const bodyIntroduced = item.introduced || "";
          const bodyDeprecated =
            item.deprecated && item.deprecated.length ? item.deprecated : "";
          const bodyUploadedFile = item.uploadedFile || "";

          // Print document header
          doc.fontSize(12).text(`${headerOfid} ${headerFieldName}`);
          doc.moveDown(0.5);

          // --- Helper function to draw a formatted row ---
          const drawRow = (label, value, padding) => {
            // If the value is null, undefined, or an empty string, do not print the row.
            if (!value) {
              return;
            }

            // Print label in bold
            doc
              .font("Helvetica-Bold")
              .fontSize(10)
              .text(label.padEnd(padding, "."), {
                continued: true,
              });

            // Print value in normal font
            doc.font("Helvetica").text(String(value || ""));
          };

          // --- Print document body using the helper ---
          drawRow("Data Type:", bodyDataType, 30);
          drawRow("Level:", bodyLevel, 34);
          drawRow("Tags:", bodyTags, 34);
          drawRow("Link Reference:", bodyLinkReference, 26);
          drawRow("Values:", bodyValues, 32);
          drawRow("Example:", bodyExample, 30);
          drawRow("Introduced:", bodyIntroduced, 29);
          drawRow("Deprecated:", bodyDeprecated, 28);
          drawRow("Uploaded File:", bodyUploadedFile, 27);
          doc.font("Helvetica-Bold").text("Description:");
          doc.font("Helvetica").text(`${bodyDescription}`);
          // drawRow("Description:", bodyDescription);

          /*           
          // Print document body
          doc
            .fontSize(10)
            .text(`Data Type: `.padEnd(25, ".") + `${bodyDataType}`);
          doc.text(`Level: `.padEnd(28, ".") + `${bodyLevel}`);
          doc.text(`Tags: `.padEnd(28, ".") + `${bodyTags}`);
          doc.text(`Introduced: `.padEnd(25, ".") + `${bodyIntroduced}`);
          doc.text(`Deprecated: `.padEnd(23, ".") + `${bodyDeprecated}`);
          doc.text(`Link Reference: `.padEnd(20, ".") + `${bodyLinkReference}`);
          doc.text(`Values: `.padEnd(25, ".") + `${bodyValues}`);
          doc.text(`Example: `.padEnd(20, ".") + `${bodyExample}`);
          doc.text(`Uploaded File: `.padEnd(20, ".") + `${bodyUploadedFile}`);
          doc.text("Description:");
          doc.text(`${bodyDescription}`);
 */
          doc.moveDown(2);
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
