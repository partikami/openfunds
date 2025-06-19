import express from "express";

import {
  uploadFile,
  uploadCSVFile,
  uploadXLSXFile,
  getFile,
  deleteFile,
} from "../controllers/file.controller.js";

const router = express.Router();

router.post("/upload", uploadFile);
router.post("/upload-csv", uploadCSVFile);
router.post("/upload-xlsx", uploadXLSXFile);
router.get("/:filename", getFile);
router.delete("/:filename", deleteFile);

export default router;
