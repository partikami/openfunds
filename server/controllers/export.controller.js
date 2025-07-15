import ExportDocument from "../models/record.model.js";
import { stringify } from "csv-stringify";
import XLSX from "xlsx"; // XLSX for Excel file generation
import PDFDocument from "pdfkit"; // PDFKit for PDF file generation
import JSZip from "jszip"; // JSZip for creating zip files
import path from "path"; // For resolving file paths
import { fileURLToPath } from "url";

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    let errorMessage = "No documents found for the selected criteria.";

    // Provide more specific error message based on filter type
    if (filterOption === "nextVersions" && filterVersion) {
      errorMessage = `No documents found for versions\n greater than ${
        Array.isArray(filterVersion) ? filterVersion.join(".") : filterVersion
      }.\n Try using a lower version number.`;
    } else if (
      (filterOption === "public" || filterOption === "all") &&
      filterVersion
    ) {
      errorMessage = `No documents found up to\n version ${
        Array.isArray(filterVersion) ? filterVersion.join(".") : filterVersion
      }.\n Try using a higher version number.`;
    }

    return res.status(404).json({ message: errorMessage });
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
        const doc = new PDFDocument({ autoFirstPage: false }); // Control page creation manually
        doc.addPage(); // Add the first page

        // Prevent browser caching
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.pdf"`
        );
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("X-Exported-Count", exportableDocs.length);

        doc.pipe(res);

        doc.fontSize(20).text("Openfunds Fields", { align: "center" });

        const filterLabel = `Filter: `.padEnd(20, ".");
        const versionLabel = `Version: `.padEnd(17, ".");

        // Format filterVersion to use dots
        const displayVersion = Array.isArray(filterVersion)
          ? filterVersion.join(".")
          : filterVersion || "All";

        doc.fontSize(12).text(`${filterLabel}${filterOption}`);
        doc.fontSize(12).text(`${versionLabel}${displayVersion || "All"}`);
        doc.moveDown(1);

        // --- Helper function to calculate an item's height before drawing ---
        const calculateItemHeight = (item) => {
          let totalHeight = 0;
          const page_width =
            doc.page.width - doc.page.margins.left - doc.page.margins.right;

          // Header height
          totalHeight += doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .heightOfString(item.fieldName, { width: page_width });
          totalHeight += doc.currentLineHeight() * 0.5; // for moveDown(0.5)

          // Body rows height
          const fieldsToDraw = [
            ["Data Type:", item.dataType],
            ["Level:", item.level],
            [
              "Tags:",
              Array.isArray(item.tags) ? item.tags.join(", ") : item.tags,
            ],
            ["Link Reference:", item.linkReference],
            ["Values:", item.values],
            ["Example:", item.example],
            ["Introduced:", item.introduced],
            ["Deprecated:", item.deprecated],
            ["Uploaded File:", item.uploadedFile],
            ["Description:", item.description],
          ];

          fieldsToDraw.forEach(([label, value]) => {
            if (value && String(value).length > 0) {
              // Since the label and value are on the same line, we take the height of the value
              // as it's the part that can wrap. This is an approximation.
              const valueHeight = doc
                .font("Helvetica")
                .fontSize(10)
                .heightOfString(String(value), { width: page_width - 100 }); // Approximate value width
              totalHeight += valueHeight;
            }
          });

          totalHeight += doc.currentLineHeight() * 2; // for moveDown(2) at the end
          return totalHeight;
        };

        exportableDocs.forEach((item, index) => {
          // --- Check if the item fits on the current page ---
          const itemHeight = calculateItemHeight(item);
          const remainingPageSpace =
            doc.page.height - doc.page.margins.bottom - doc.y;

          if (itemHeight > remainingPageSpace) {
            doc.addPage();
          }

          const headerOfid = item.ofid || "";
          const headerFieldName = item.fieldName || "";
          const bodyDataType = item.dataType || "";

          // Sanitize fields that may contain carriage returns
          const bodyDescription = (item.description || "").replace(
            /\r\n?/g,
            "\n"
          );
          const bodyValues = (
            item.values && item.values.length ? String(item.values) : ""
          ).replace(/\r\n?/g, "\n");
          const bodyExample = (item.example || "").replace(/\r\n?/g, "\n");

          const bodyLevel = item.level || "";
          const bodyTags = item.tags ? item.tags.join(", ") : "";
          const bodyLinkReference = item.linkReference || "";

          // Format introduced and deprecated versions to use dots
          const bodyIntroduced = Array.isArray(item.introduced)
            ? item.introduced.join(".")
            : item.introduced || "";
          const bodyDeprecated = Array.isArray(item.deprecated)
            ? item.deprecated.join(".")
            : item.deprecated || "";

          const bodyUploadedFile = item.uploadedFile || "";

          // Print document header
          doc.fontSize(12).text(`${headerOfid} ${headerFieldName}`);
          doc.moveDown(0.25);

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
          doc.font("Helvetica-Bold").text("Description:");
          doc.font("Helvetica").text(`${bodyDescription}`);
          drawRow("Uploaded File:", bodyUploadedFile, 27);

          // Show image if uploadedFile exists and is an image
          if (
            bodyUploadedFile &&
            /\.(png|jpg|jpeg|gif)$/i.test(bodyUploadedFile)
          ) {
            try {
              // Use __dirname from line 10 for path resolution
              const imagePath = path.resolve(
                __dirname,
                "../../uploads",
                bodyUploadedFile
              );
              doc.moveDown(0.5);
              doc.image(imagePath, {
                fit: [480, 270], // Adjust size as needed
                // align: "left",
              });
              doc.moveDown(0.5);
            } catch (err) {
              doc
                .font("Helvetica")
                .fillColor("red")
                .text("Image not found or cannot be loaded.");
            }
          } else {
            drawRow("Uploaded File:", bodyUploadedFile, 27);
          }

          doc.moveDown(2);
        });

        doc.end();
        break;

      // Case for HTML export
      case "html":
        res.setHeader("Content-Type", "text/html");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.html"`
        );
        res.setHeader("X-Exported-Count", exportableDocs.length);
        let htmlContent = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Openfunds Export</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
              }
              h1 {
                  text-align: center;
              }
              .document {
                  margin-bottom: 20px;
                  padding: 10px;
                  border: 1px solid #ccc;
              }
              .document h2 {
                  margin-top: 0;
              }
              .document p {
                  margin: 5px 0;
              }
              .document img {
                  max-width: 100%;
                  height: auto;
              }
          </style>
      </head>
      <body>
          <h1>Openfunds Export</h1>
          <p>Filter: ${filterOption}</p>
          <p>Version: ${filterVersion ? filterVersion.join(".") : "All"}</p>`;

        // Add this part to generate the actual content
        exportableDocs.forEach((item) => {
          htmlContent += `
          <div class="document">
              <h2>${item.ofid} ${item.fieldName}</h2>
              <p><strong>Data Type:</strong> ${item.dataType || ""}</p>
              <p><strong>Level:</strong> ${item.level || ""}</p>
              <p><strong>Tags:</strong> ${
                Array.isArray(item.tags)
                  ? item.tags.join(", ")
                  : item.tags || ""
              }</p>
              <p><strong>Link Reference:</strong> ${
                item.linkReference || ""
              }</p>
              <p><strong>Values:</strong> ${item.values || ""}</p>
              <p><strong>Example:</strong> ${item.example || ""}</p>
              <p><strong>Introduced:</strong> ${
                Array.isArray(item.introduced)
                  ? item.introduced.join(".")
                  : item.introduced || ""
              }</p>
              <p><strong>Deprecated:</strong> ${
                Array.isArray(item.deprecated)
                  ? item.deprecated.join(".")
                  : item.deprecated || ""
              }</p>
              <p><strong>Description:</strong> ${item.description || ""}</p>`;

          // Add image if it exists
          if (
            item.uploadedFile &&
            /\.(png|jpg|jpeg|gif)$/i.test(item.uploadedFile)
          ) {
            htmlContent += `
              <p><strong>Image:</strong></p>
              <img src="data:image/png;base64,IMAGE_DATA_HERE" alt="${item.uploadedFile}">
              <p><em>Note: In an actual implementation, you would need to convert the image to base64 or provide a URL.</em></p>`;
          } else if (item.uploadedFile) {
            htmlContent += `
              <p><strong>Uploaded File:</strong> ${item.uploadedFile}</p>`;
          }

          htmlContent += `
          </div>`;
        });

        // Close the HTML document
        htmlContent += `
      </body>
      </html>`;

        return res.send(htmlContent);
        break;

      // Case for HTML snippet export
      case "snippet":
        const zip = new JSZip();

        // Create individual HTML files for each document
        exportableDocs.forEach((item) => {
          const htmlContent = `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${item.ofid} ${item.fieldName}</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      margin: 20px;
                      line-height: 1.6;
                  }
                  .document {
                      max-width: 800px;
                      margin: 0 auto;
                      padding: 20px;
                      border: 1px solid #ddd;
                      border-radius: 8px;
                  }
                  .document h1 {
                      color: #333;
                      border-bottom: 2px solid #007acc;
                      padding-bottom: 10px;
                  }
                  .document p {
                      margin: 10px 0;
                  }
                  .document strong {
                      color: #555;
                  }
                  .document img {
                      max-width: 100%;
                      height: auto;
                      border: 1px solid #ddd;
                      border-radius: 4px;
                      margin: 10px 0;
                  }
              </style>
          </head>
          <body>
              <div class="document">
                  <h1>${item.ofid}\n ${item.fieldName}</h1>
                  <p><strong>Data Type:</strong> ${item.dataType || ""}</p>
                  <p><strong>Level:</strong> ${item.level || ""}</p>
                  <p><strong>Tags:</strong> ${
                    Array.isArray(item.tags)
                      ? item.tags.join(", ")
                      : item.tags || ""
                  }</p>
                  <p><strong>Link Reference:</strong> ${
                    item.linkReference || ""
                  }</p>
                  <p><strong>Values:</strong> ${item.values || ""}</p>
                  <p><strong>Example:</strong> ${item.example || ""}</p>
                  <p><strong>Introduced:</strong> ${
                    Array.isArray(item.introduced)
                      ? item.introduced.join(".")
                      : item.introduced || ""
                  }</p>
                  <p><strong>Deprecated:</strong> ${
                    Array.isArray(item.deprecated)
                      ? item.deprecated.join(".")
                      : item.deprecated || ""
                  }</p>
                  <p><strong>Description:</strong> ${item.description || ""}</p>
                  ${
                    item.uploadedFile &&
                    /\.(png|jpg|jpeg|gif)$/i.test(item.uploadedFile)
                      ? `<p><strong>Image:</strong></p>
                        <img src="data:image/png;base64,IMAGE_DATA_HERE" alt="${item.uploadedFile}">
                        <p><em>Note: In an actual implementation, you would need to convert the image to base64 or provide a URL.</em></p>`
                      : item.uploadedFile
                      ? `<p><strong>Uploaded File:</strong> ${item.uploadedFile}</p>`
                      : ""
                  }
              </div>
          </body>
          </html>`;

          // Add file to zip with ofid as filename
          zip.file(`${item.ofid}.html`, htmlContent);
        });

        // Generate zip file
        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}_snippets.zip"`
        );
        res.setHeader("X-Exported-Count", exportableDocs.length);
        return res.send(zipBuffer);

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
