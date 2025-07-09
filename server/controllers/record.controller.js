// This file contains the controller functions for handling requests related to records.
// It includes functions to read all records, create a new record, read a single record by id, and update a record by id.
// It uses the Mongoose library to interact with a MongoDB database and the Express framework to handle HTTP requests and responses.

import Field from "../models/record.model.js";

// This gets a list of all the records
export const readAll = async (req, res) => {
  // let collection = await db.collection("records");
  // let collection = await connectDB.collection("records");
  const result = await Field.find();
  res.status(200).send(result);
};

// This creates a new record
export const createOne = async (req, res) => {
  const {
    ofid,
    fieldName,
    dataType,
    description,
    values,
    level,
    tags,
    example,
    linkReference,
    introduced,
    deprecated,
  } = req.body;

  // Parse introduced if it's a stringified array
  if (typeof introduced === "string" && introduced.startsWith("[")) {
    try {
      introduced = JSON.parse(introduced);
    } catch (e) {
      return res.status(400).send("Invalid introduced version format");
    }
  }

  // Parse deprecated if it's a stringified array
  if (typeof deprecated === "string" && deprecated.startsWith("[")) {
    try {
      deprecated = JSON.parse(deprecated);
    } catch (e) {
      return res.status(400).send("Invalid deprecated version format");
    }
  }

  // Validate the input data
  if (!ofid || !fieldName || !introduced) {
    return res
      .status(400)
      .send("All of ofid, fieldName and introduced are required");
  }

  // Check if the OFID already exists in the database
  let ofidAlreadyExists = false;
  try {
    const existing = await Field.findOne({ ofid });
    if (existing) {
      ofidAlreadyExists = true;
    }
  } catch (err) {
    console.error("Error checking OFID existence:", err);
    return res.status(500).send("Error checking OFID existence");
  }

  if (ofidAlreadyExists) {
    return res
      .status(400)
      .json({ success: false, message: "OFID already exists" });
  }

  try {
    const ofField = new Field({
      ofid,
      fieldName,
      dataType,
      description,
      values,
      level,
      tags,
      example,
      linkReference,
      introduced,
      deprecated,
    });
    await ofField.save();
    res.status(204).send(ofField);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
};

// Helper function to handle retrieving a document by id
// and sending a 404 response if not found.
const getDocumentById = async (Model, id, res) => {
  try {
    const document = await Model.findById(id);
    if (!document) {
      res.status(404).send("Record not found");
      return null;
    }
    return document;
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
    return null;
  }
};

// This gets a single record by id
export const readOne = async (req, res) => {
  const ofField = await getDocumentById(Field, req.params.id, res);
  if (ofField) {
    res.send(ofField);
  }
};

// This updates a record by id
export const updateOne = async (req, res) => {
  const ofField = await getDocumentById(Field, req.params.id, res);
  if (ofField) {
    let update = req.body;

    if (
      typeof update.introducedArray === "string" &&
      update.introducedArray.startsWith("[")
    ) {
      try {
        update.introduced = JSON.parse(update.introducedArray);
        delete update.introducedArray;
      } catch (error) {
        return res.status(400).send("Invalid introduced version format");
      }
    }

    // Parse deprecated if it's a stringified array
    if (
      typeof update.deprecatedArray === "string" &&
      update.deprecatedArray.startsWith("[")
    ) {
      try {
        update.deprecated = JSON.parse(update.deprecatedArray);
        delete update.deprecatedArray;
        // Remove the string field so only the array remains
        // if (typeof update.deprecated === "string") delete update.deprecated;
      } catch (error) {
        return res.status(400).send("Invalid deprecated version format");
      }
    }

    try {
      const updatedOfField = await Field.findByIdAndUpdate(
        req.params.id,
        update,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!updatedOfField) return res.status(404).send("Record not found");
      res.send(updatedOfField);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  }
};

// This deletes a record by id.
export const deleteOne = async (req, res) => {
  const ofField = await getDocumentById(Field, req.params.id, res);
  if (ofField) {
    try {
      let result = await ofField.deleteOne({ _id: req.params.id });
      if (!result) return res.status(404).send("Record not found");
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send("Error deleting record");
    }
  }
};
