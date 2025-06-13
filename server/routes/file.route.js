import express from "express";

import {
  uploadFile,
  getFile,
  deleteFile,
} from "../controllers/file.controller.js";

const router = express.Router();

router.post("/upload", uploadFile);
router.get("/:filename", getFile);
router.delete("/:filename", deleteFile);

export default router;
