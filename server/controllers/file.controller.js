import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import { readFile, writeFile, set_fs } from "xlsx";
import * as fs from "fs";
import mongoose from "mongoose";

set_fs(fs); // Set the fs module for XLSX

import Field from "../models/record.model.js";

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
    await Field.deleteMany({});

    // Insert the new documents
    if (Array.isArray(jsonData)) {
      await Field.insertMany(jsonData);
    } else {
      await Field.create(jsonData);
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

/* 
export async function importJSONFile(req, res) {
  saveUploadedFileAndRespond({
    req,
    res,
    processFile: ({ req, res }) => {
      res.status(200).json({
        message: "JSON file upladed successfully",
        jsonFileName: req.file.filename,
      });
    },
  });

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const fileName = req.file.filename;
    const filePath = path.join(__dirname, "../uploads", fileName);

    // Read and parse the uploaded JSON file
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Remove all documents from the openfunds collection
    await Field.deleteMany({});

    // Insert the new documents
    // If jsonData is an array, insertMany; if it's an object, insertOne
    if (Array.isArray(jsonData)) {
      await Field.insertMany(jsonData);
    } else {
      await Field.create(jsonData);
    }

    res.json({
      message:
        "JSON file uploaded and openfunds collection replaced successfully.",
      filename: fileName,
      count: Array.isArray(jsonData) ? jsonData.length : 1,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error processing JSON file: " + error.message });
  }
}


// --- JSON Upload ---
export function uploadJSONFile(req, res) {
  saveUploadedFileAndRespond({
    req,
    res,
    processFile: ({ req, res }) => {
      res.status(200).json({
        message: "JSON file upladed successfully",
        jsonFileName: req.file.filename,
      });
    },
  });
}
 */

// --- CSV Upload ---
export function uploadCSVFile(req, res) {
  saveUploadedFileAndRespond({
    req,
    res,
    processFile: ({ fileName, filePath, res }) => {
      const jsonFileName = fileName.replace(/\.csv$/i, ".json");
      const jsonFilePath = path.join(__dirname, "../../uploads", jsonFileName);
      const results = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
          res.json({
            message: "CSV file uploaded and converted to JSON successfully",
            csvFile: fileName,
            jsonFile: jsonFileName,
            data: results,
          });
        })
        .on("error", (error) => {
          res
            .status(500)
            .json({ error: "Error processing CSV file: " + error.message });
        });
    },
  });
}

// --- XLSX Upload ---
export function uploadXLSXFile(req, res) {
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
