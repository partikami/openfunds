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

// Get the import file format
// const { importOption } = req.body;

// Helper function
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

    return res.json({
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
}

// --- CSV Import ---
export async function importCSVFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const fileName = req.file.filename;
  const csvFilePath = path.join(__dirname, "../../uploads", fileName);

  const results = [];
  let responded = false; // Prevent multiple responses

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
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          // Validate required fields
          const requiredFields = ["ofid", "fieldName", "introduced"];
          const invalidRows = results.filter((row) =>
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
          await Openfund.insertMany(results);

          if (!responded) {
            responded = true;
            responded = true;
            return res.json({
              message:
                "CSV file imported and openfunds collection replaced successfully.",
              filename: fileName,
              count: results.length,
            });
          }
        } catch (error) {
          if (!responded) {
            responded = true;
            return res
              .status(500)
              .json({ error: "Error importing CSV data: " + error.message });
          }
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

/* 
// --- XLSX Import ---
export function importXLSXFile(req, res) {
  saveUploadedFileAndRespond({
    req,
    res,
    processFile: ({ fileName, filePath, res }) => {
      try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const jsonFileName = fileName.replace(/\.xlsx$/i, ".json");
        const jsonFilePath = path.join(
          __dirname,
          "../../uploads",
          jsonFileName
        );

        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
        res.json({
          message: "XLSX file uploaded and converted to JSON successfully.",
          xlsxFile: fileName,
          jsonFile: jsonFileName,
          data: jsonData,
        });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Error processing XLSX file: " + error.message });
      }
    },
  });
}
 */
