import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import exportFile from "../controllers/export.controller.js";

const router = express.Router();
router.post("/exportFile", exportFile);

export default router;
