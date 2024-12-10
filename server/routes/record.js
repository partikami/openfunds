import express from "express";

// This helps to connect to the database
import db from "../db/connection.js";

// This helps to convert the id from string to ObjectId for the _id
import { ObjectId } from "mongodb";

/* router is an instance of the express router.
We use it to define our routes.
The router will be added as middleware and will
take control of requests starting with path /record. */
const router = express.Router();

// This helps to get a list of all the records.
router.get("/", async (req, res) => {
  let collection = await db.collection("records");
  let results = await collection.find({}).toArray();
  res.status(200).send(results);
});

// This helps to get a single record by id.
router.get("/:id", async (req, res) => {
  let collection = await db.collection("records");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);
  // console.log(result);

  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

// This helps to create a new record.
router.post("/", async (req, res) => {
  try {
    let newDocument = {
      ofid: req.body.ofid,
      fieldName: req.body.fieldName,
      dataType: req.body.dataType,
      description: req.body.description,
      values: req.body.values,
      level: req.body.level,
      tags: req.body.tags,
      example: req.body.example,
      linkReference: req.body.linkReference,
      introduced: req.body.introduced,
      depricated: req.body.depricated,
    };
    const collection = db.collection("records");
    let result = await collection.insertOne(newDocument);
    res.status(204).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});

// This helps to update a record by id.
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        ofid: req.body.ofid,
        fieldName: req.body.fieldName,
        dataType: req.body.dataType,
        description: req.body.description,
        values: req.body.values,
        level: req.body.level,
        tags: req.body.tags,
        example: req.body.example,
        linkReference: req.body.linkReference,
        introduced: req.body.introduced,
        depricated: req.body.depricated,
      },
    };
    const collection = db.collection("records");
    let result = await collection.updateOne(query, updates);
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating record");
  }
});

// This helps to delete a record by id.
router.delete("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const collection = db.collection("records");
    let result = await collection.deleteOne(query);
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting record");
  }
});

export default router;
