import axios from "axios";
import { useState } from "react";

import { useFileStore } from "../store/fileStore";

const UPLOAD_STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
};

function FileUploader({ ofid, bgColor }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(UPLOAD_STATUS.IDLE);

  // Zustand setter to save the uploaded file and set status to null
  const setUploadedFile = useFileStore((state) => state.setUploadedFile);

  // Get the uploaded file from Zustand store
  const uploadedFile = useFileStore((state) => state.uploadedFile);

  function handleFileChange(event) {
    // Check if files are selected
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  }

  async function handleFileUpload() {
    if (!file) return;
    setStatus(UPLOAD_STATUS.UPLOADING);

    const formData = new FormData();
    formData.append("ofid", ofid);
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5050/files/upload-image",
        formData
      );
      // Save the server response file data to Zustand store
      setUploadedFile(response.data.file);
      console.log("File upload was successfully:", response.data.file);
      setStatus(UPLOAD_STATUS.SUCCESS);
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatus(UPLOAD_STATUS.ERROR);
    }
  }

  return (
    <div className="w-full">
      <div
        className={`flex items-center px-2 ${bgColor} text-gray-700 border border-gray-700 rounded mb-3 leading-tight`}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="appearance-none block w-full text-gray-700 border py-2 leading-tight file:py-3 file:px-5 file:mr-4 file:bg-gray-400 file:rounded-lg"
          id="fileUpload"
          name="fileUpload"
        />
        {file && status !== UPLOAD_STATUS.UPLOADING && (
          <button
            onClick={handleFileUpload}
            className="py-2 px-4 float-left text-center text-gray-100 font-bold text-lg border-2 border-black bg-cyan-900 hover:bg-cyan-800 hover:text-white rounded-lg transition duration-300"
          >
            Upload
          </button>
        )}
      </div>
      {uploadedFile ? (
        <div className="mt-2 mb-4 text-gray-700">
          File size: {(uploadedFile.size / 1024).toFixed(2)} KB <br />
          File type: {uploadedFile.mimetype}
        </div>
      ) : (
        file && (
          <div className="mt-2 mb-4 text-gray-700">
            File size: {(file.size / 1024).toFixed(2)} KB <br />
            File type: {file.type}
          </div>
        )
      )}
      {status === UPLOAD_STATUS.SUCCESS && (
        <div className="text-green-600">File uploaded successfully!</div>
      )}
      {status === UPLOAD_STATUS.ERROR && (
        <div className="text-red-600">
          Error uploading file. Please try again.
        </div>
      )}
    </div>
  );
}

export default FileUploader;
