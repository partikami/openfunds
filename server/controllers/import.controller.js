import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import { set_fs } from "xlsx";
import * as fs from "fs";

set_fs(fs); // Set the fs module for XLSX

import Openfund from "../models/record.model.js";
import buildReplaceBulkOps from "../utils/buildReplaceBulkOps.js";
import findInvalidRows from "../utils/findInvalidRows.js";
import fixObjectIds from "../utils/fixObjectIds.js";
import saveUploadedFileAndRespond from "../utils/uploadImage.js";
import splitTags from "../utils/splitTags.js";

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the required fields for Openfund records
const REQUIRED_FIELDS = ["ofid", "fieldName", "introduced"];

// Error response helper
const sendError = (
  res,
  error,
  message = "General error processing request."
) => {
  console.error(message, error); // Optional: log to server console
  if (!res.headersSent) {
    return res.status(500).json({ message, error: error?.message || error });
  }
};

//  --- Image Upload ---
export function uploadImageFile(req, res) {
  saveUploadedFileAndRespond({
    req,
    res,
    processFile: ({ req, res }) => {
      return res.status(200).json({
        message: "Image uploaded successfully",
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    },
  });
}

// --- JSON Import ---
export async function importJSONFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const fileName = req.file.filename;
    const filePath = path.join(__dirname, "../../uploads", fileName);

    const importOption = req.body.importOption || "deleteAllAndImport"; // Default import option

    // Read and parse the uploaded JSON file for appending
    let jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Helper to fix _id fields
    jsonData = fixObjectIds(jsonData);

    switch (importOption) {
      case "deleteAllAndImport":
        try {
          // Validate required fields
          const invalidRows = findInvalidRows(jsonData, REQUIRED_FIELDS);
          if (invalidRows.length > 0) {
            return res.status(400).json({
              error:
                "JSON contains rows with missing values for at least one of the required fields:\n - ofid,\n - fieldName,\n - introduced.",
              invalidRows,
            });
          }

          // Remove all documents from the openfunds collection
          await Openfund.deleteMany({});

          // Insert the new documents
          if (Array.isArray(jsonData)) {
            await Openfund.insertMany(jsonData);
          } else {
            await Openfund.create(jsonData);
          }

          return res.status(200).json({
            message: `Existing documents deleted. 
            ${jsonData.length} new documents appended.`,
            filename: fileName,
            count: Array.isArray(jsonData) ? jsonData.length : 1,
          });
        } catch (error) {
          if (!res.headersSent) {
            sendError(
              res,
              error,
              "Error processing the JSON import with this option: Delete All and Import."
            );
          }
        }
        break;

      case "skipExisting":
        try {
          const invalidRows = findInvalidRows(jsonData, REQUIRED_FIELDS);
          if (invalidRows.length > 0) {
            return res.status(400).json({
              error:
                "JSON contains rows missing required fields: ofid, fieldName, introduced.",
              invalidRows,
            });
          }

          // Get all existing ofid values as strings
          const existingOfidsSkip = new Set(
            (await Openfund.find({}, { ofid: 1 }).lean()).map((doc) =>
              String(doc.ofid)
            )
          );

          // Filter out documents that already exist (by ofid)
          const newDocumentsToInsertSkip = jsonData
            .filter((newDoc) => !existingOfidsSkip.has(String(newDoc.ofid)))
            .map((doc) => {
              // Remove _id so MongoDB can generate a new one
              const { _id, ...rest } = doc;
              return rest;
            });

          if (newDocumentsToInsertSkip.length > 0) {
            await Openfund.insertMany(newDocumentsToInsertSkip);
          }
          return res.status(200).json({
            message: `${jsonData.length} documents processed.\n ${
              jsonData.length - newDocumentsToInsertSkip.length
            } existing documents skipped.\n ${
              newDocumentsToInsertSkip.length
            } new documents appended.`,
            filename: fileName,
            count: jsonData.length,
          });
        } catch (error) {
          sendError(
            res,
            error,
            "Error processing the JSON import with this option: Skip existing."
          );
        }
        break;

      case "replaceExisting":
        try {
          // Validate required fields
          const invalidRows = findInvalidRows(jsonData, REQUIRED_FIELDS);
          if (invalidRows.length > 0) {
            return res.status(400).json({
              error:
                "JSON contains rows missing required fields: ofid, fieldName, introduced.",
              invalidRows,
            });
          }

          // Get all existing ofid values
          const existingOfids = new Set(
            (await Openfund.find({}, { ofid: 1 }).lean()).map((doc) => doc.ofid)
          );

          // Use helper to build bulk operations
          const { bulkOps, counterReplaced, counterInserted } =
            buildReplaceBulkOps(jsonData, existingOfids, "ofid");

          if (bulkOps.length > 0) {
            await Openfund.bulkWrite(bulkOps);
          }
          return res.status(200).json({
            message: `${jsonData.length} documents processed.\n ${counterReplaced} existing documents replaced.\n ${counterInserted} new documents appended.`,
            filename: fileName,
            count: jsonData.length,
          });
        } catch (error) {
          sendError(
            res,
            error,
            "Error processing the JSON import with this option: Replace existing."
          );
        }
        break;
      default:
        return res.status(400).json({ message: "Invalid import option." });
    }
  } catch (error) {
    sendError(res, error, "Error processing JSON import.");
  }
}

// --- CSV Import ---
export async function importCSVFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const fileName = req.file.filename;
    const csvFilePath = path.join(__dirname, "../../uploads", fileName);

    const csvData = [];

    const importOption = req.body.importOption || "deleteAllAndImport"; // Default import option

    fs.createReadStream(csvFilePath)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.replace(/^\uFEFF/, ""), // Remove BOM from first header
        })
      )
      .on("data", (data) => csvData.push(splitTags(data)))
      .on("end", async () => {
        switch (importOption) {
          case "deleteAllAndImport":
            try {
              // Validate required fields
              const invalidRows = findInvalidRows(csvData, REQUIRED_FIELDS);
              if (invalidRows.length > 0) {
                return res.status(400).json({
                  error:
                    "CSV contains rows missing required fields: ofid, fieldName, introduced.",
                  invalidRows,
                });
              }

              // Remove all documents from the openfunds collection
              await Openfund.deleteMany({});

              // Insert the new documents
              await Openfund.insertMany(csvData);

              return res.status(200).json({
                message: `Existing documents deleted.
                ${csvData.length} new documents appended.`,
                filename: fileName,
                count: csvData.length,
              });
            } catch (error) {
              sendError(
                res,
                error,
                "Error processing import:\n CSV-Delete all and import."
              );
            }
            break;

          case "skipExisting":
            try {
              // Validate required fields
              const invalidRows = findInvalidRows(csvData, REQUIRED_FIELDS);
              if (invalidRows.length > 0) {
                return res.status(400).json({
                  error:
                    "CSV contains rows missing required fields: ofid, fieldName, introduced.",
                  invalidRows,
                });
              }

              // Get all existing ofid values as strings
              const existingDocumentIdsSkip = new Set(
                (await Openfund.find({}, { ofid: 1 }).lean()).map((doc) =>
                  String(doc.ofid)
                )
              );

              // Filter out rows that already exist (by ofid)
              const newDocumentsToInsertSkip = csvData
                .filter(
                  (newDoc) => !existingDocumentIdsSkip.has(String(newDoc.ofid))
                )
                .map((doc) => {
                  // Remove _id so MongoDB can generate a new one
                  const { _id, ...rest } = doc;
                  return rest;
                });

              if (newDocumentsToInsertSkip.length > 0) {
                await Openfund.insertMany(newDocumentsToInsertSkip);
              }

              return res.status(200).json({
                message: `${csvData.length} documents processed.\n ${
                  csvData.length - newDocumentsToInsertSkip.length
                } existing documents skipped.\n ${
                  newDocumentsToInsertSkip.length
                } new documents appended.`,
                filename: fileName,
                count: csvData.length,
              });
            } catch (error) {
              sendError(
                res,
                error,
                "Error processing import:\n CSV-Skip existing."
              );
            }
            break;

          case "replaceExisting":
            try {
              // Validate required fields
              const invalidRows = findInvalidRows(csvData, REQUIRED_FIELDS);
              if (invalidRows.length > 0) {
                return res.status(400).json({
                  error:
                    "CSV contains rows missing required fields: ofid, fieldName, introduced.",
                  invalidRows,
                });
              }

              // Get all existing ofid values as strings
              const existingOfids = new Set(
                (await Openfund.find({}, { ofid: 1 }).lean()).map((doc) =>
                  String(doc.ofid)
                )
              );

              // Use helper to build bulk operations
              const { bulkOps, counterReplaced, counterInserted } =
                buildReplaceBulkOps(csvData, existingOfids, "ofid");

              if (bulkOps.length > 0) {
                await Openfund.bulkWrite(bulkOps);
              }

              return res.status(200).json({
                message: `${csvData.length} documents processed.\n ${counterReplaced} existing documents replaced.\n ${counterInserted} new documents appended.`,
                filename: fileName,
                count: csvData.length,
              });
            } catch (error) {
              sendError(
                res,
                error,
                "Error processing import: \n CSV-Replace existing."
              );
            }
            break;

          default:
            return res.status(400).json({ message: "Invalid import option." });
        }
      });
  } catch (error) {
    sendError(res, error, "Error processing CSV import.");
  }
}

// --- XLSX Import ---
export async function importXLSXFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const fileName = req.file.filename;
    const xlsxFilePath = path.join(__dirname, "../../uploads", fileName);

    const importOption = req.body.importOption || "deleteAllAndImport"; // Default import option

    switch (importOption) {
      case "deleteAllAndImport":
        try {
          // Read and parse the XLSX file
          const workbook = XLSX.readFile(xlsxFilePath);
          const sheetName = workbook.SheetNames[0];
          let xlsxData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

          // Handle tags column as pipe-separated values
          xlsxData = xlsxData.map(splitTags);

          // Validate required fields
          const invalidRows = findInvalidRows(xlsxData, REQUIRED_FIELDS);
          if (invalidRows.length > 0) {
            return res.status(400).json({
              error:
                "XLSX contains rows missing required fields: ofid, fieldName, introduced.",
              invalidRows,
            });
          }

          // Remove all documents from the openfunds collection
          await Openfund.deleteMany({});

          // Insert the new documents
          await Openfund.insertMany(xlsxData);

          return res.status(200).json({
            message: `Existing documents deleted.
            ${xlsxData.length} new documents appended.`,
            filename: fileName,
            count: xlsxData.length,
          });
        } catch (error) {
          sendError(
            res,
            error,
            "Error processing XLSX import with this option: Delete All and Import."
          );
        }
        break;

      case "skipExisting":
        try {
          // Read and parse the XLSX file
          const workbook = XLSX.readFile(xlsxFilePath);
          const sheetName = workbook.SheetNames[0];
          let xlsxData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

          // Handle tags column as pipe-separated values
          xlsxData = xlsxData.map(splitTags);

          // Get all existing ofid values as strings
          const existingOfids = new Set(
            (await Openfund.find({}, { ofid: 1 }).lean()).map((doc) =>
              String(doc.ofid)
            )
          );

          // Validate required fields
          const invalidRows = findInvalidRows(xlsxData, REQUIRED_FIELDS);
          if (invalidRows.length > 0) {
            return res.status(400).json({
              error:
                "XLSX contains rows missing required fields: ofid, fieldName, introduced.",
              invalidRows,
            });
          }

          // Filter out rows that already exist (by ofid)
          const newDocumentsToInsertSkip = xlsxData
            .filter((newDoc) => !existingOfids.has(String(newDoc.ofid)))
            .map((doc) => {
              // Remove _id if present
              const { _id, ...rest } = doc;
              return rest;
            });

          if (newDocumentsToInsertSkip.length > 0) {
            await Openfund.insertMany(newDocumentsToInsertSkip);
          }

          return res.status(200).json({
            message: `${xlsxData.length} documents processed.\n ${
              xlsxData.length - newDocumentsToInsertSkip.length
            } existing documents skipped.\n ${
              newDocumentsToInsertSkip.length
            } new documents appended.`,
            filename: fileName,
            count: xlsxData.length,
          });
        } catch (error) {
          sendError(
            res,
            error,
            "Error processing XLSX import with this option: Skip Existing."
          );
        }
        break;

      case "replaceExisting":
        try {
          // Read and parse the XLSX file
          const workbook = XLSX.readFile(xlsxFilePath);
          const sheetName = workbook.SheetNames[0];
          let xlsxData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

          // Handle tags column as pipe-separated values
          xlsxData = xlsxData.map(splitTags);

          // Get all existing ofid values as strings
          const existingOfids = new Set(
            (await Openfund.find({}, { ofid: 1 }).lean()).map((doc) =>
              String(doc.ofid)
            )
          );

          // Validate required fields
          const invalidRows = findInvalidRows(xlsxData, REQUIRED_FIELDS);
          if (invalidRows.length > 0) {
            return res.status(400).json({
              error:
                "XLSX contains rows missing required fields: ofid, fieldName, introduced.",
              invalidRows,
            });
          }

          // Use helper to build bulk operations
          const { bulkOps, counterReplaced, counterInserted } =
            buildReplaceBulkOps(xlsxData, existingOfids, "ofid");

          if (bulkOps.length > 0) {
            await Openfund.bulkWrite(bulkOps);
          }

          return res.status(200).json({
            message: `${xlsxData.length} documents processed.\n ${counterReplaced} existing documents replaced.\n ${counterInserted} new documents appended.`,
            filename: fileName,
            count: xlsxData.length,
          });
        } catch (error) {
          sendError(
            res,
            error,
            "Error processing XLSX import with this option: Replace Existing."
          );
        }
        break;

      default:
        return res.status(400).json({ message: "Invalid import option." });
    }
  } catch (error) {
    sendError(res, error, "Error processing XLSX import.");
  }
}
