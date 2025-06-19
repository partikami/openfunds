import express from "express";

import {
  uploadImageFile,
  uploadCSVFile,
  uploadXLSXFile,
  getFile,
  deleteFile,
} from "../controllers/file.controller.js";

const router = express.Router();

router.post("/upload-image", uploadImageFile);
router.post("/upload-csv", uploadCSVFile);
router.post("/upload-xlsx", uploadXLSXFile);
router.get("/:filename", getFile);
router.delete("/:filename", deleteFile);

export default router;
