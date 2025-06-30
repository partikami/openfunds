const findInvalidRows = (data, REQUIRED_FIELDS) => {
  return data.filter((row) =>
    REQUIRED_FIELDS.some((field) => {
      const value = row[field];
      if (typeof value === "string") {
        return value.trim() === "";
      }
      return value === undefined || value === null;
    })
  );
};

export default findInvalidRows;
