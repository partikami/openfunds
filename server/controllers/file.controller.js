import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import { readFile, writeFile, set_fs } from "xlsx";
import * as fs from "fs";

set_fs(fs); // Set the fs module for XLSX

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      // const { filename, originalname, size, mimetype } = req.file;
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
            message: "CSV file uploaded and converted to JSON successfully.",
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
