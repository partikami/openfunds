import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  ofid: {
    type: String,
    required: true,
    unique: true,
  },
  fieldName: {
    type: String,
    required: true,
  },
  dataType: {
    type: String,
  },
  description: {
    type: String,
  },
  values: {
    type: String,
  },
  level: {
    type: String,
  },
  tags: {
    type: ["String"],
  },
  example: {
    type: String,
  },
  linkReference: {
    type: String,
  },
  introduced: {
    type: Number,
    required: true,
  },
  debricated: {
    type: Number,
  },
});

export default mongoose.model("Record", recordSchema);
