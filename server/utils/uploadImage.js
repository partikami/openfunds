import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saveUploadedFileAndRespond = ({ req, res, processFile }) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const fileName = req.file.filename;
    const filePath = path.join(__dirname, "../../uploads", fileName);

    processFile({ fileName, filePath, req, res });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error processing file: " + error.message });
  }
};

export default saveUploadedFileAndRespond;
