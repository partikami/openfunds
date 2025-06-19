import { useRef } from "react";

export default function FileUploader() {
  const fileInputRef = useRef(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    // Process file upload, e.g. update state or send the file to your server
    console.log("File selected:", e.target.files[0]);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleImportClick}
        className={`py-2 px-4  text-gray-700 border`}
      >
        Import
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        name="file"
      />
    </div>
  );
}
