import express from "express";

import {
  readAll,
  readOne,
  createOne,
  updateOne,
  deleteOne,
} from "../controllers/record.controller.js";

const router = express.Router();

router.get("/", readAll); // Get all records
router.get("/:id", readOne); // Get a single record by id
router.post("/", createOne); // Create a new record
router.patch("/:id", updateOne); // Update a record by id
router.delete("/:id", deleteOne); // Delete a record by id

export default router;
