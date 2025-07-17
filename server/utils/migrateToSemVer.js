import mongoose from "mongoose";
import semver from "semver";
import Field from "../models/record.model.js";

// const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/openfunds";

async function migrateToSemVer() {
  await mongoose.connect(uri);
  console.log("Mongoose connected to MongoDB.");

  const docs = await Field.find({ introduced: { $type: "string" } });
  console.log(`Found ${docs.length} documents to process.`);

  for (const doc of docs) {
    const docId = doc._id;
    const introducedStr = doc.introduced;

    try {
      // 1. Expand two-digit versions to three digits
      const parts = introducedStr.split(".");
      let introducedStrExpanded = introducedStr;

      if (parts.length === 2) {
        introducedStrExpanded = `${introducedStr}.0`;
        console.log(
          `Expanding '${introducedStr}' to '${introducedStrExpanded}' for document ID: ${docId}`
        );
      }

      // 2. Parse the string using semver and convert to an array of numbers
      const parsedVersion = semver.parse(introducedStrExpanded);

      if (!parsedVersion) {
        throw new Error(
          `Invalid semver string after expansion: '${introducedStrExpanded}'`
        );
      }

      const introducedArray = [
        parsedVersion.major,
        parsedVersion.minor,
        parsedVersion.patch,
      ];
      console.log(
        `Converting '${introducedStrExpanded}' to [${introducedArray.join(
          ","
        )}] for document ID: ${docId}`
      );

      // 3. Update the document in MongoDB
      await Field.updateOne(
        { _id: docId },
        { $set: { introduced: introducedArray } }
      );
      console.log(`Successfully updated document ID: ${docId}`);
    } catch (error) {
      console.error(
        `Error processing document ID ${docId} with value '${introducedStr}': ${error.message}`
      );
      console.log(`Skipping update for document ID: ${docId}`);
    }
  }

  await mongoose.disconnect();
  console.log("Migration complete.");
}

migrateToSemVer().catch(console.error);

/* 
    // let versionString = doc.introduced;
    let versionString = "1.2.3";
    console.log(versionString);
    console.log(typeof versionString);

    const semverRegex =
      /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
    const match = versionString.match(semverRegex);

    console.log(match);

    if (!match) {
      return null; // Does not follow semantic versioning rules
    }

    const [, major, minor, patch, preRelease, buildMetadata] = match;

    // const parsed = semver.parse(versionString);
    const parsed = [
      parseInt(major, 10),
      parseInt(minor, 10),
      parseInt(patch, 10),
    ];

    if (!parsed) {
      console.warn(
        `Skipping invalid version: ${doc.introduced} (id: ${doc._id})`
      );
      continue;
    }

    doc.introduced = [
      parsed.major,
      parsed.minor,
      parsed.patch,
      parsed.prerelease.length ? parsed.prerelease.join(".") : null,
    ];

    await doc.save();
    console.log(`Updated document ${doc._id} to`, doc.introduced);
       } */
