import express from "express";

import {
  uploadImageFile,
  // importJSONFile,
  // importCSVFile,
  // importXLSXFile,
} from "../controllers/file.controller.js";

const router = express.Router();

router.post("/upload-image", uploadImageFile);
// router.post("/import-json", importJSONFile);
// router.post("/import-csv", importCSVFile);
// router.post("/import-xlsx", importXLSXFile);

export default router;
