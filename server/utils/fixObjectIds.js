import mongoose from "mongoose";

const fixObjectIds = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(fixObjectIds);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      if (
        key === "_id" &&
        obj[key] &&
        typeof obj[key] === "object" &&
        "$oid" in obj[key]
      ) {
        newObj[key] = new mongoose.Types.ObjectId(obj[key]["$oid"]);
      } else {
        newObj[key] = fixObjectIds(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

export default fixObjectIds;
