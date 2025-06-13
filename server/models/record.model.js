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
  tags: [
    {
      type: String,
      enum: [
        "Country-AT",
        "Country-BE",
        "Country-CH",
        "Country-DE",
        "Country-DK",
        "Country-FR",
        "Country-GB",
        "Country-IE",
        "Country-IT",
        "Country-LI",
        "Country-LU",
        "Country-NL",
        "Deprecated",
        "Draft",
        "Dynamic Data",
        "Experimental",
        "FinDatex-CEPT",
        "FinDatex-EET",
        "FinDatex-EMT",
        "FinDatex-EPT",
        "FinDatex-TPT",
        "Internal",
        "Public",
        "Private",
        "Stable",
        "Under Review",
      ],
      required: false,
    },
  ],
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
  deprecated: {
    type: Number,
  },
  uploadedFile: {
    type: String,
  },
});

export default mongoose.model("Record", recordSchema);
