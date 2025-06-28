import React, { useState } from "react";
import { Search } from "lucide-react";

import Input from "../components/Input.jsx";
import FloatingShape from "../components/FloatingShape";

const ToolsPage = () => {
  const [importOption, setImportOption] = useState("Rebuild"); // Default value
  const [fileFormat, setFileFormat] = useState("JSON"); // Default value
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage(""); // Clear previous messages
  };

  const handleOptionChange = (event) => {
    setImportOption(event.target.value);
  };

  const [fileName, setFileName] = useState("");
  const handleButtonClick = () => {};
  const fileInputRef = React.useRef(null);

  const handleImportSubmit = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setMessage("Importing documents...");

    const formData = new FormData();
    formData.append("jsonFile", selectedFile);
    formData.append("importOption", importOption);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/import-json",
        formData
      );

      const data = response.data;

      if (response.status === 200) {
        setMessage(`Success: ${data.message}`);
      } else {
        setMessage(`Error: ${data.message || "Something went wrong."}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
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
        <h2 className="text-3xl text-white font-bold mb-5">Export</h2>
        <form className="ml-2 text-gray-100">
          <div className="flex flex-wrap gap-4">
            <fieldset className="border border-gray-100 w-32 pl-4 pb-2 rounded-lg">
              <legend className="text-lg font-semibold mb-2">Format</legend>
              <input type="radio" id="JSON" name="format" value="JSON" />
              <label htmlFor="JSON" className="pl-2">
                JSON
              </label>
              <br />
              <input type="radio" id="CSV" name="format" value="CSV" />
              <label htmlFor="CSV" className="pl-2">
                CSV
              </label>
              <br />
              <input type="radio" id="HTML" name="format" value="HTML" />
              <label htmlFor="HTML" className="pl-2">
                HTML
              </label>
              <br />
              <input type="radio" id="PDF" name="format" value="PDF" />
              <label htmlFor="PDF" className="pl-2">
                PDF
              </label>
            </fieldset>
            <fieldset className="border border-gray-100 w-64 pl-4 pb-2 rounded-lg">
              <legend className="text-lg font-semibold mb-2">Content</legend>
              <input
                type="radio"
                id="Current_public"
                name="content"
                value="Current_public"
              />
              <label htmlFor="Current_public" className="pl-2">
                Current public fields
              </label>
              <br />
              <input
                type="radio"
                id="Including_internal"
                name="content"
                value="Including_internal"
              />
              <label htmlFor="Including_internal" className="pl-2">
                Including internal fields
              </label>
              <br />
              <input type="radio" id="Next" name="content" value="Next" />
              <label htmlFor="Next" className="pl-2">
                Next version / under review
              </label>
            </fieldset>
          </div>
          <button className="mt-8 w-[25rem] border border-gray-100 h-12 rounded-lg text-2xl font-bold hover:bg-gray-100 hover:text-cyan-900 transition duration-300">
            Export
          </button>

          <h2 className="text-3xl mt-16 text-white font-bold mb-5">Import</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <fieldset className="border border-gray-100 w-32 pl-4 pb-2 rounded-lg">
              <legend className="text-lg font-semibold text-gray-100 mb-2">
                Format
              </legend>
              <input type="radio" id="JSON" name="format" value="JSON" />
              <label htmlFor="JSON" className="pl-2">
                JSON
              </label>
              <br />
              <input type="radio" id="CSV" name="format" value="CSV" />
              <label htmlFor="CSV" className="pl-2">
                CSV
              </label>
              <br />
              <input type="radio" id="XLSX" name="format" value="XLSX" />
              <label htmlFor="XLSX" className="pl-2">
                XLSX
              </label>
            </fieldset>
            <fieldset className="border border-gray-100 w-64 pl-4 pb-2 rounded-lg">
              <legend className="text-lg font-semibold text-gray-100 mb-2">
                Option
              </legend>
              <input type="radio" id="Rebuild" name="content" value="Rebuild" />
              <label htmlFor="Rebuild" className="pl-2">
                Delete all and import
              </label>
              <br />
              <input type="radio" id="Append" name="content" value="Append" />
              <label htmlFor="Append" className="pl-2">
                Append and skip existing
              </label>
              <br />
              <input
                type="radio"
                id="Overwrite"
                name="content"
                value="Overwrite"
              />
              <label htmlFor="Overwrite" className="pl-2">
                Append and replace existing
              </label>
            </fieldset>
          </div>
          <br />
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <div className=" border border-gray-100 rounded-lg hover:bg-gray-100 hover:text-cyan-900 transition duration-300 cursor-pointer">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" // Tailwind class to hide the input
                />

                {/* Single text line that acts as a button */}
                <div
                  className="flex items-center px-6 py-2"
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                >
                  {/* Lucid React Search Icon with Tailwind text color and margin */}
                  <Search size={24} className=" mr-2" />{" "}
                  <div className="w-80 text-lg">
                    {selectedFile ? selectedFile.name : "Please choose a file"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleImportSubmit}
                className="mt-8 w-[25rem] border border-gray-100 h-12 rounded-lg text-2xl font-bold hover:bg-gray-100 hover:text-cyan-900 transition duration-300"
              >
                Import
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToolsPage;
