import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import { readFile, writeFile, set_fs } from "xlsx";
import * as fs from "fs";
import mongoose from "mongoose";

set_fs(fs); // Set the fs module for XLSX

import Openfund from "../models/record.model.js";

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function for image upload
function saveUploadedFileAndRespond({ req, res, processFile }) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const fileName = req.file.filename;
    const filePath = path.join(__dirname, "../../uploads", fileName);

    processFile({ fileName, filePath, req, res });
  } catch (error) {
    res.status(500).json({ error: "Error processing file: " + error.message });
  }
}

//  --- Image Upload ---
export function uploadImageFile(req, res) {
  saveUploadedFileAndRespond({
    req,
    res,
    processFile: ({ req, res }) => {
      res.status(200).json({
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

// Helper to recursively convert {_id: {$oid: ...}} to ObjectId
function fixObjectIds(obj) {
  if (Array.isArray(obj)) {
    return obj.map(fixObjectIds);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      if (
        key === "_id" &&
        obj[key] &&
        typeof obj[key] === "object" &&
        "$oid" in obj[key]
      ) {
        newObj[key] = new mongoose.Types.ObjectId(obj[key]["$oid"]);
      } else {
        newObj[key] = fixObjectIds(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// --- JSON Import ---
export async function importJSONFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const fileName = req.file.filename;
  const filePath = path.join(__dirname, "../../uploads", fileName);

  const importOption = req.body.importOption || "deleteAllAndImport"; // Default import option

  // Read and parse the uploaded JSON file for appending
  let jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Fix _id fields
  jsonData = fixObjectIds(jsonData);
  console.log("Records: " + jsonData.length);

  switch (importOption) {
    case "deleteAllAndImport":
      try {
        // Read and parse the uploaded JSON file
        let jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

        // Fix _id fields
        jsonData = fixObjectIds(jsonData);

        // Remove all documents from the openfunds collection
        await Openfund.deleteMany({});

        // Insert the new documents
        if (Array.isArray(jsonData)) {
          await Openfund.insertMany(jsonData);
        } else {
          await Openfund.create(jsonData);
        }

        return res.status(200).json({
          message:
            "JSON file uploaded and openfunds collection replaced successfully.",
          filename: fileName,
          count: Array.isArray(jsonData) ? jsonData.length : 1,
        });
      } catch (error) {
        if (!res.headersSent) {
          return res
            .status(500)
            .json({ error: "Error processing JSON file: " + error.message });
        }
      }
      break;

    case "skipExisting":
      try {
        // Get all existing _id values as strings
        const existingDocumentIdsSkip = new Set(
          (await Openfund.find({}, { _id: 1 }).lean()).map((doc) =>
            String(doc._id)
          )
        );

        // Filter out documents that already exist (by _id)
        const newDocumentsToInsertSkip = jsonData
          .filter((newDoc) => !existingDocumentIdsSkip.has(String(newDoc._id)))
          .map((doc) => {
            // Remove _id so MongoDB can generate a new one
            const { _id, ...rest } = doc;
            return rest;
          });

        if (newDocumentsToInsertSkip.length > 0) {
          await Openfund.insertMany(newDocumentsToInsertSkip);
        }
        return res.status(200).json({
          message: `${
            newDocumentsToInsertSkip.length
          } new documents appended. ${
            jsonData.length - newDocumentsToInsertSkip.length
          } existing documents skipped.`,
        });
      } catch (error) {
        console.error("Import error: ", error);
        res.status(500).json({
          message: "Error processing skip existing. ",
          error: error.message,
        });
      }
      break;

    case "replaceExisting":
      try {
        const existingDocumentIdsReplace = new Set(
          (await Openfund.find({}, { ofid: 1 }).lean()).map((doc) => doc.ofid)
        );
        const bulkOps = [];
        let counterReplaced = 0;
        let counterInserted = 0;

        for (const newDoc of jsonData) {
          if (existingDocumentIdsReplace.has(newDoc.ofid)) {
            // Replace existing document by ofid, but remove _id from replacement
            const { _id, ...replacementDoc } = newDoc;
            bulkOps.push({
              replaceOne: {
                filter: { ofid: newDoc.ofid },
                replacement: replacementDoc,
                upsert: true, // If not found, insert (though it should be found here)
              },
            });
            counterReplaced++;
          } else {
            // Insert new document, remove ofid so MongoDB generates a new one
            const { _id, ...docWithoutId } = newDoc;
            bulkOps.push({
              insertOne: {
                document: docWithoutId,
              },
            });
            counterInserted++;
          }
        }

        if (bulkOps.length > 0) {
          await Openfund.bulkWrite(bulkOps);
        }
        return res.status(200).json({
          message: `${jsonData.length} documents processed. ${counterReplaced} documents replaced and ${counterInserted} documents inserted.`,
        });
      } catch (error) {
        console.error("Import error: ", error);
        res.status(500).json({
          message: "Error processing replace existing. ",
          error: error.message,
        });
      }
      break;
    default:
      return res.status(400).json({ message: "Invalid import option." });
  }
}

// --- CSV Import ---
export async function importCSVFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const fileName = req.file.filename;
  const csvFilePath = path.join(__dirname, "../../uploads", fileName);

  const csvData = [];
  let responded = false; // Prevent multiple responses

  const importOption = req.body.importOption || "deleteAllAndImport"; // Default import option

  try {
    fs.createReadStream(csvFilePath)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.replace(/^\uFEFF/, ""), // Remove BOM from first header
          mapValues: ({ header, value }) =>
            header === "tags"
              ? value
                  .split("|")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              : value,
        })
      )
      .on("data", (data) => csvData.push(data))
      .on("end", async () => {
        switch (importOption) {
          case "deleteAllAndImport":
            try {
              // Validate required fields
              const requiredFields = ["ofid", "fieldName", "introduced"];
              const invalidRows = csvData.filter((row) =>
                requiredFields.some(
                  (field) => !row[field] || row[field].trim() === ""
                )
              );
              if (invalidRows.length > 0) {
                responded = true;
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

              if (!responded) {
                responded = true;
                responded = true;
                return res.json({
                  message:
                    "CSV file imported and openfunds collection replaced successfully.",
                  filename: fileName,
                  count: csvData.length,
                });
              }
            } catch (error) {
              if (!responded) {
                responded = true;
                return res.status(500).json({
                  error: "Error importing CSV data: " + error.message,
                });
              }
            }
            break;

          case "skipExisting":
            try {
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
              if (!responded) {
                responded = true;
                return res.status(200).json({
                  message: `${
                    newDocumentsToInsertSkip.length
                  } new documents appended. ${
                    csvData.length - newDocumentsToInsertSkip.length
                  } existing documents skipped.`,
                });
              }
            } catch (error) {
              if (!responded) {
                responded = true;
                return res.status(500).json({
                  message: "Error processing skip existing.",
                  error: error.message,
                });
              }
            }
            break;

          case "replaceExisting":
            try {
              // Get all existing ofid values as strings
              const existingOfids = new Set(
                (await Openfund.find({}, { ofid: 1 }).lean()).map((doc) =>
                  String(doc.ofid)
                )
              );
              const bulkOps = [];
              let counterUpdated = 0;
              let counterInserted = 0;

              for (const newDoc of csvData) {
                if (existingOfids.has(String(newDoc.ofid))) {
                  // Update existing document by ofid, remove _id from update
                  const { _id, ...updateDoc } = newDoc;
                  bulkOps.push({
                    updateOne: {
                      filter: { ofid: newDoc.ofid },
                      update: { $set: updateDoc },
                      upsert: false,
                    },
                  });
                  counterUpdated++;
                } else {
                  // Insert new document, remove _id if present
                  const { _id, ...docWithoutId } = newDoc;
                  bulkOps.push({
                    insertOne: {
                      document: docWithoutId,
                    },
                  });
                  counterInserted++;
                }
              }

              if (bulkOps.length > 0) {
                await Openfund.bulkWrite(bulkOps);
              }
              if (!responded) {
                responded = true;
                return res.status(200).json({
                  message: `${csvData.length} documents processed. ${counterUpdated} updated and ${counterInserted} inserted.`,
                });
              }
            } catch (error) {
              if (!responded) {
                responded = true;
                return res.status(500).json({
                  message: "Error processing update existing.",
                  error: error.message,
                });
              }
            }
            break;

          default:
            return res.status(400).json({ message: "Invalid import option." });
        }
      })
      .on("error", (error) => {
        if (!responded) {
          responded = true;
          return res
            .status(500)
            .json({ error: "Error processing CSV file: " + error.message });
        }
      });
  } catch (error) {
    if (!responded) {
      responded = true;
      return res
        .status(500)
        .json({ error: "Error processing CSV file: " + error.message });
    }
  }
}

// --- XLSX Import ---
export async function importXLSXFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const fileName = req.file.filename;
  const xlsxFilePath = path.join(__dirname, "../../uploads", fileName);

  try {
    // Read and parse the XLSX file
    const workbook = XLSX.readFile(xlsxFilePath);
    const sheetName = workbook.SheetNames[0];
    let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Handle tags column as pipe-separated values
    jsonData = jsonData.map((row) => ({
      ...row,
      tags:
        typeof row.tags === "string"
          ? row.tags
              .split("|")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(row.tags)
          ? row.tags
          : [],
    }));

    // Remove all documents from the openfunds collection
    await Openfund.deleteMany({});

    // Insert the new documents
    await Openfund.insertMany(jsonData);

    return res.json({
      message:
        "XLSX file imported and openfunds collection replaced successfully.",
      filename: fileName,
      count: jsonData.length,
    });
  } catch (error) {
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: "Error processing XLSX file: " + error.message });
    }
  }
}
