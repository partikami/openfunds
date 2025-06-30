const buildReplaceBulkOps = (data, existingKeys, keyField = "ofid") => {
  const bulkOps = [];
  let counterReplaced = 0;
  let counterInserted = 0;

  for (const doc of data) {
    if (existingKeys.has(String(doc[keyField]))) {
      const { _id, ...replacementDoc } = doc;
      bulkOps.push({
        replaceOne: {
          filter: { [keyField]: doc[keyField] },
          replacement: replacementDoc,
          upsert: true,
        },
      });
      counterReplaced++;
    } else {
      const { _id, ...docWithoutId } = doc;
      bulkOps.push({
        insertOne: {
          document: docWithoutId,
        },
      });
      counterInserted++;
    }
  }
  return { bulkOps, counterReplaced, counterInserted };
};

export default buildReplaceBulkOps;
