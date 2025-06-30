const splitTags = (tagsString) => {
  return {
    ...tagsString,
    tags:
      typeof tagsString === "string"
        ? tagsString
            .split("|")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : Array.isArray(tagsString.tags)
        ? tagsString.tags
        : [],
  };
};

export default splitTags;
