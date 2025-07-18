import React, { useState } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import FloatingShape from "../components/FloatingShape";
import { parseSemanticVersion } from "../utilities/versionHelper.js";
import { useAuthStore } from "../store/authStore"; // Import the auth store

// Helper component for a single radio group
const RadioGroup = ({ title, name, options, selectedValue, onChange }) => (
  <div className="flex-1 bg-gray-100 p-4 rounded-md border border-gray-200 h-full">
    <h3 className="text-lg font-medium mb-2 text-gray-800">{title}:</h3>
    <div className="flex flex-col space-y-2">
      {options.map((option) => (
        <label key={option.value} className="inline-flex items-center">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={onChange}
            className="form-radio h-4 w-4 text-cyan-700 border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

// Handler for file input component
const FileInput = ({ onFileChange, fileName, className = "" }) => {
  const fileInputRef = React.useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={`inline-block ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
      />
      <div
        className="flex items-center px-4 py-2 bg-cyan-700 text-gray-100 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:bg-gray-100 hover:text-gray-700 transition-colors duration-300 ease-in-out"
        onClick={handleButtonClick}
      >
        <Search size={20} className="mr-2" />
        <span className="text-base whitespace-nowrap overflow-hidden text-ellipsis">
          {fileName ? fileName : "Please choose file"}
        </span>
      </div>
    </div>
  );
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"; // Fallback for local dev

const ToolsPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Get auth state from store

  // Filter export options based on authentication status
  const exportFileFormatOptions = isAuthenticated
    ? [
        { label: "JSON", value: "json" },
        { label: "CSV", value: "csv" },
        { label: "XLSX", value: "xlsx" },
        { label: "PDF", value: "pdf" },
        { label: "HTML File", value: "html" },
        { label: "HTML Snippets", value: "snippet" },
      ]
    : [
        { label: "JSON", value: "json" },
        { label: "CSV", value: "csv" },
      ];

  const exportFilterOptions = isAuthenticated
    ? [
        { label: "Public Fields Only", value: "public" },
        { label: "Public And Internal Fields", value: "all" },
        { label: "Next Versions Only", value: "nextVersions" },
      ]
    : [{ label: "Public", value: "public" }];

  // Define import options arrays
  const importFileFormatOptions = [
    { label: "JSON", value: "json" },
    { label: "CSV", value: "csv" },
    { label: "XLSX", value: "xlsx" },
  ];

  const importOptionOptions = [
    { label: "Rebuild", value: "deleteAllAndImport" },
    { label: "Skip Existing Fields", value: "skipExisting" },
    { label: "Replace Existing Fields", value: "replaceExisting" },
  ];

  // Calculate the maximum number of options across all RadioGroups
  const allOptionCounts = [
    ...(isAuthenticated
      ? [importFileFormatOptions.length, importOptionOptions.length]
      : []),
    exportFileFormatOptions.length,
    exportFilterOptions.length,
  ];
  const maxOptions = Math.max(...allOptionCounts);

  // Calculate dynamic height: base height + (option height * number of options) + padding + bottom margin
  const baseHeight = 60; // Height for title and padding
  const optionHeight = 28; // Height per option (including spacing)
  const bottomMargin = 20; // Additional bottom margin
  const dynamicHeight = baseHeight + maxOptions * optionHeight + bottomMargin;

  // State variables for import/export options and file handling
  const [exportFileFormat, setExportFileFormat] = useState("json"); // Default value
  const [exportFilter, setExportFilter] = useState("public"); // Default value
  const [importFileFormat, setImportFileFormat] = useState("json"); // Default value
  const [importOption, setImportOption] = useState("deleteAllAndImport"); // Default value
  const [importFile, setImportFile] = useState(null);
  const [exportVersionInput, setExportVersionInput] = useState(""); // Input for export version
  const [exportVersion, setExportVersion] = useState(""); // State for export version
  const [wrongInput, setWrongInput] = useState(false); // State for wrong input
  const [message, setMessage] = useState(""); // State for messages

  // --- DATA IMPORT ---

  const handleFileChange = (event) => {
    setImportFile(event.target.files[0]);
    setMessage(""); // Clear previous messages
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a file to import.", {
        duration: 5000,
        position: "top-center",
      });
      return;
    }

    // Check file extension matches selected format
    const extension = importFile.name.split(".").pop().toLowerCase();
    if (
      (importFileFormat === "json" && extension !== "json") ||
      (importFileFormat === "csv" && extension !== "csv") ||
      (importFileFormat === "xlsx" && extension !== "xlsx")
    ) {
      toast.error(
        `Selected file type (.${extension}) does not match the chosen format (${importFileFormat.toUpperCase()}).`,
        {
          duration: 4000,
          position: "top-center",
          className: "whitespace-pre-line",
        }
      );
      return;
    }

    // Set the URL based on the selected file format
    let url = `${API_BASE_URL}/import/import-json`;
    if (importFileFormat === "csv") {
      url = `${API_BASE_URL}/import/import-csv`;
    } else if (importFileFormat === "xlsx") {
      url = `${API_BASE_URL}/import/import-xlsx`;
    }

    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("format", importFileFormat);
    formData.append("importOption", importOption);

    try {
      setMessage("Importing documents...");
      const response = await axios.post(url, formData);

      if (response.status === 200) {
        setMessage(""); // Clear previous messages
        toast.success("Import successful!\n" + " " + response.data.message, {
          duration: 4000,
          position: "top-center",
          className: "whitespace-pre-line",
        });
      } else {
        setMessage("Import failed:");
      }
    } catch (error) {
      console.error("Error importing file:", error);
      setMessage("Error importing file!");
      // Show toast with backend error message if available
      const backendMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unknown error";
      toast.error("Import failed!\n" + backendMsg, {
        duration: 5000,
        position: "top-center",
      });
    }
  };

  // --- DATA EXPORT ---

  // Handler for export version input change
  const handleExportVersionChange = (e) => {
    const value = e.target.value;
    setExportVersionInput(value);

    // For "public", "all", and "nextVersions" filters:
    if (value.trim() !== "") {
      const parsed = parseSemanticVersion(value);
      setWrongInput(!parsed);
      if (parsed) {
        setExportVersion(parsed);
      } else {
        setExportVersion("");
      }
    } else {
      // When input is empty, clear any errors.
      setWrongInput(false);
      setExportVersion("");
    }
  };

  // Handler for export version input blur event
  const handleExportVersionBlur = (e) => {
    const value = e.target.value;
    if (value.trim() !== "") {
      const parsed = parseSemanticVersion(value);
      setWrongInput(!parsed);
      if (parsed) {
        setExportVersion(parsed);
      }
    } else {
      setWrongInput(false);
      setExportVersion("");
    }
  };

  const handleExport = async () => {
    let url = `${API_BASE_URL}/export/exportFile`;

    // Make the API call for export
    try {
      const response = await axios.post(
        url,
        {
          format: exportFileFormat,
          filterOption: exportFilter,
          filterVersion: exportVersion ? exportVersion : null, // Use parsed version or null if empty
        },
        {
          responseType: "blob", // <-- Important for file downloads!
        }
      );

      // Get filename from Content-Disposition header if available
      let filename = "exported_file." + exportFileFormat; // fallback filename
      const disposition = response.headers["content-disposition"];
      if (disposition && disposition.indexOf("filename=") !== -1) {
        filename = disposition
          .split("filename=")[1]
          .replace(/['"]/g, "")
          .trim();
      }

      // Create a blob and trigger download
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);

      const exportedCount = response.headers["x-exported-count"];
      toast.success(
        "Export successful!\n" + " " + exportedCount + " documents exported.",
        {
          duration: 4000,
          position: "top-center",
        }
      );
    } catch (error) {
      console.error("Error exporting file:", error);

      // Extract the specific error message from the server response
      let errorMessage = "Export failed!";
      if (error.response?.data) {
        // For blob responses, we need to convert the blob to text to read the error
        if (error.response.data instanceof Blob) {
          try {
            const errorText = await error.response.data.text();
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            // If parsing fails, use the generic message
            errorMessage =
              error.response?.data?.message || error.message || errorMessage;
          }
        } else {
          // For regular JSON responses
          errorMessage =
            error.response.data.message || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    }
  };

  return (
    <div className="min-h-[800px] h-full  border border-t-0 border-gray-100 bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-900 flex flex-col relative overflow-hidden">
      <FloatingShape
        color="bg-cyan-500"
        size="w-64 h-64"
        top="0%"
        left="20%"
        delay={0}
      />
      <FloatingShape
        color="bg-cyan-500"
        size="w-48 h-48"
        top="70%"
        left="80%"
        delay={5}
      />
      <FloatingShape
        color="bg-cyan-500"
        size="w-32 h-32"
        top="40%"
        left="10%"
        delay={2}
      />

      <div className="ml-10 mt-12 text-white relative z-10">
        <h1 className="text-3xl text-white font-bold mb-5">
          {isAuthenticated ? "Data Import and Export" : "Data Export"}
        </h1>

        <div className="flex flex-col lg:flex-row items-start mb-8 gap-8 lg:min-h-[32rem]">
          {/* Import Options */}
          {isAuthenticated ? (
            <div className="flex flex-col p-5 h-full lg:min-h-[30rem] border border-gray-100 rounded-lg w-full max-w-xl bg-gradient-to-r from-cyan-700 to-cyan-800 text-white">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">
                Import Data
              </h2>

              {/* RadioGroups Container */}
              <div
                className="flex gap-4 mb-6"
                style={{ height: `${dynamicHeight}px` }}
              >
                <RadioGroup
                  title="File Format"
                  name="importFormat"
                  options={importFileFormatOptions}
                  selectedValue={importFileFormat}
                  onChange={(e) => setImportFileFormat(e.target.value)}
                />

                <RadioGroup
                  title="Import Option"
                  name="importOption"
                  options={importOptionOptions}
                  selectedValue={importOption}
                  onChange={(e) => setImportOption(e.target.value)}
                />
              </div>

              {/* File Input Section */}
              <div className="mb-6 text-gray-100">
                <label
                  htmlFor="importFileInput"
                  className="block text-gray-100 text-lg font-bold mb-2"
                >
                  Choose File for Import:
                </label>
                <FileInput
                  onFileChange={handleFileChange}
                  fileName={importFile?.name}
                  className="w-full"
                />
              </div>

              <button
                type="button"
                onClick={handleImport}
                className="w-full mt-auto bg-cyan-600 text-white hover:bg-gray-200 hover:text-gray-800 font-semibold py-3 px-6 border border-gray-300 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-75"
              >
                Import Data
              </button>
            </div>
          ) : null}

          {/* Export Options */}
          <div
            className={`flex flex-col p-5 ${
              isAuthenticated ? "mr-8" : ""
            } h-full lg:min-h-[30rem] w-full max-w-xl border border-gray-100 rounded-lg bg-gradient-to-r from-cyan-700 to-cyan-800 text-white`}
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-4">
              Export Data
            </h2>

            {/* RadioGroups Container */}
            <div
              className="flex gap-4 mb-6"
              style={{ height: `${dynamicHeight}px` }}
            >
              <RadioGroup
                title="File Format"
                name="exportFormat"
                options={exportFileFormatOptions}
                selectedValue={exportFileFormat}
                onChange={(e) => setExportFileFormat(e.target.value)}
              />

              <RadioGroup
                title="Filter"
                name="exportFilter"
                options={exportFilterOptions}
                selectedValue={exportFilter}
                onChange={(e) => setExportFilter(e.target.value)}
              />
            </div>

            {/* Version Input Section */}
            <div className="mb-6">
              <label
                htmlFor="exportVersion"
                className="font-bold text-gray-100 text-lg"
              >
                {exportFilter === "nextVersions"
                  ? "Versions greater than:"
                  : "Up to and incl. version:"}
              </label>
              <div className="flex flex-row items-center gap-4">
                <input
                  type="text"
                  id="exportVersion"
                  name="exportVersion"
                  value={exportVersionInput}
                  placeholder="e.g., 2.18.3"
                  onChange={handleExportVersionChange}
                  onBlur={handleExportVersionBlur}
                  className="mt-2 w-[12rem] text-lg flex items-center px-4 py-1 bg-cyan-700 text-gray-100 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:bg-gray-100 hover:text-gray-700 transition-colors duration-300 ease-in-out"
                />

                <div className={`mt-2 text-gray-100`}>
                  {exportFilter === "nextVersions" && !exportVersionInput
                    ? "Version needed."
                    : exportVersionInput && wrongInput
                    ? "Please use semantic versioning:\n (major.minor.patch, e.g., 2.0.15)."
                    : "Empty for all versions."}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className={`w-full mt-auto font-semibold py-3 px-6 border border-gray-300 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-75
    ${
      (exportFilter === "nextVersions" &&
        (!exportVersionInput || wrongInput)) ||
      ((exportFilter === "public" || exportFilter === "all") &&
        exportVersionInput &&
        wrongInput)
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-cyan-700 text-white hover:bg-gray-200 hover:text-gray-800"
    }`}
              disabled={
                (exportFilter === "nextVersions" &&
                  (!exportVersionInput || wrongInput)) ||
                ((exportFilter === "public" || exportFilter === "all") &&
                  exportVersionInput &&
                  wrongInput)
              }
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
