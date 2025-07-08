import { Form, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import FileUploader from "./FileUploader.jsx";
import { useFileStore } from "../store/fileStore.js";
import { parseSemanticVersion } from "../utilities/versionHelper.js";

export default function FieldEdit({ method, field }) {
  const navigate = useNavigate();
  const [ofid, setOfid] = useState(field ? field.ofid : "");

  // Create a state for tags, defaulting to the field's tags if any.
  const [selectedTags, setSelectedTags] = useState(field?.tags || []);

  // Create a state for the semantic versioning on the introduced field.
  const [introducedInput, setIntroducedInput] = useState(
    Array.isArray(field?.introduced)
      ? field.introduced.filter((v) => v !== null && v !== undefined).join(".")
      : field?.introduced || ""
  );

  // Create a state for the semantic version on the deprecated field.
  const [deprecatedInput, setDeprecatedInput] = useState(
    Array.isArray(field?.deprecated)
      ? field.deprecated.filter((v) => v !== null && v !== undefined).join(".")
      : field?.deprecated || ""
  );

  // Create a state for wrong version format
  const [wrongIntroducedInput, setWrongIntroducedInput] = useState(false); // State for wrong input in Introduced field
  const [wrongDeprecatedInput, setWrongDeprecatedInput] = useState(false); // State for wrong input in Deprecated field

  // Access both the uploaded file and its setter from Zustand
  const uploadedFile = useFileStore((state) => state.uploadedFile);
  const setUploadedFile = useFileStore((state) => state.setUploadedFile);

  // Only clear the uploaded file if the field doesn't have one.
  useEffect(() => {
    if (field?.uploadedFile) {
      setUploadedFile(null);
    }
  }, [setUploadedFile, field]);

  function handleCancel() {
    navigate("..");
  }

  // Compute bgColor based on selectedTags so it updates immediately.
  const bgColor = selectedTags.includes("Under Review")
    ? "bg-yellow-100"
    : "bg-gray-200";

  // Handler for tag selection changes.
  function handleTagsChange(e) {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedTags(selected);
  }

  // Handler for Form submission.
  function handleFormSubmit(e) {
    setWrongIntroducedInput(false);
    setWrongDeprecatedInput(false);

    const parsedIntroduced = parseSemanticVersion(introducedInput);
    if (!parsedIntroduced) {
      e.preventDefault();
      setWrongIntroducedInput(true);
      toast.error(
        "Please enter a valid semantic version\n for Introduced (e.g., 2.0.15)",
        {
          duration: 5000,
          position: "top-center",
        }
      );
    }

    const parsedDeprecated = parseSemanticVersion(deprecatedInput);
    if (deprecatedInput && !parsedDeprecated) {
      e.preventDefault();
      setWrongDeprecatedInput(true);
      toast.error(
        "Please enter a valid semantic version\n for Deprecated (e.g., 2.1.0)",
        {
          duration: 5000,
          position: "top-center",
        }
      );
    }
  }

  return (
    <Form method={method} onSubmit={handleFormSubmit}>
      <div className="flow-root mb-8">
        <button
          type="submit"
          className="py-2 px-4 float-right text-center text-gray-100 font-bold text-lg border-2 border-black bg-cyan-900 hover:bg-cyan-800 hover:text-white rounded-lg transition duration-300"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="py-2 px-2 float-right mr-4 text-center text-cyan-900 font-bold text-lg border-2 border-cyan-900 bg-white hover:bg-gray-300 hover:text-gray-800 rounded-lg transition duration-300"
        >
          Cancel
        </button>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full md:w-1/3 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="ofid"
          >
            OFID
          </label>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="ofid"
            name="ofid"
            type="text"
            required
            value={ofid}
            onChange={(e) => setOfid(e.target.value)}
          />
        </div>

        <div className="w-full md:w-2/3 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="fieldName"
          >
            Field Name
          </label>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="fieldName"
            name="fieldName"
            type="text"
            required
            defaultValue={field ? field.fieldName : ""}
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full md:w-1/3 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="dataType"
          >
            Data Type
          </label>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="dataType"
            name="dataType"
            type="text"
            defaultValue={field ? field.dataType : ""}
          />
        </div>

        <div className="w-full md:w-1/3 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="level"
          >
            Level
          </label>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="level"
            name="level"
            type="text"
            defaultValue={field ? field.level : ""}
          />
        </div>

        <div className="w-full md:w-1/3 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="tags"
          >
            Tags (Select multiple)
          </label>
          <select
            id="tags"
            name="tags"
            multiple
            value={selectedTags}
            onChange={handleTagsChange}
            className={`appearance-none block w-full ${bgColor} text-gray-700 border border-gray-700 rounded py-1 px-4 mb-3 leading-tight max-h-16 overflow-y-auto`}
          >
            {field &&
              field.tags &&
              field.tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            {/* Optionally, add additional predefined tags */}
            <option value="Country-AT">Country-AT</option>
            <option value="Country-BE">Country-BE</option>
            <option value="Country-CH">Country-CH</option>
            <option value="Country-DE">Country-DE</option>
            <option value="Country-DK">Country-DK</option>
            <option value="Country-FR">Country-FR</option>
            <option value="Country-GB">Country-GB</option>
            <option value="Country-IE">Country-IE</option>
            <option value="Country-IT">Country-IT</option>
            <option value="Country-LI">Country-LI</option>
            <option value="Country-LU">Country-LU</option>
            <option value="Country-NL">Country-NL</option>
            <option value="Deprecated">Deprecated</option>
            <option value="Draft">Draft</option>
            <option value="Dynamic Data">Dynamic Data</option>
            <option value="Experimental">Experimental</option>
            <option value="FinDatex-CEPT">FinDatex-CEPT</option>
            <option value="FinDatex-EET">FinDatex-EET</option>
            <option value="FinDatex-EMT">FinDatex-EMT</option>
            <option value="FinDatex-EPT">FinDatex-EPT</option>
            <option value="FinDatex-TPT">FinDatex-TPT</option>
            <option value="Internal">Internal</option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="Stable">Stable</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap -mx-3">
        <div className="w-full md:w-1/3 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="linkReference"
          >
            Link Reference
          </label>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="linkReference"
            name="linkReference"
            type="text"
            defaultValue={field ? field.linkReference : ""}
          />
        </div>

        <div className="w-full md:w-1/3 px-3">
          <div className="flex flex-row items-center gap-4">
            <label
              className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
              htmlFor="introduced"
            >
              Introduced in Version
            </label>
            <div
              className={`-mt-2 ${
                wrongIntroducedInput ? "text-red-600" : "text-gray-100"
              }`}
            >
              {" "}
              {wrongIntroducedInput
                ? "Use semantic versioning, e.g. 2.0.15"
                : ""}
            </div>
          </div>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="introduced"
            name="introduced"
            type="text"
            value={introducedInput}
            onChange={(e) => setIntroducedInput(e.target.value)}
          />
          <input
            type="text"
            id="introducedArray"
            name="introducedArray"
            value={JSON.stringify(parseSemanticVersion(introducedInput) || [])}
          />
        </div>

        <div className="w-full md:w-1/3 px-3">
          <div className="flex flex-row items-center gap-4">
            <label
              className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
              htmlFor="deprecated"
            >
              Valid until Version
            </label>
            <div
              className={`-mt-2 ${
                wrongDeprecatedInput ? "text-red-600" : "text-gray-100"
              }`}
            >
              {" "}
              {wrongDeprecatedInput
                ? "Use semantic versioning, e.g. 2.1.0"
                : ""}
            </div>
          </div>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="deprecated"
            name="deprecated"
            type="text"
            value={deprecatedInput}
            onChange={(e) => setDeprecatedInput(e.target.value)}
          />
          <input
            type="text"
            id="deprecatedArray"
            name="deprecatedArray"
            value={JSON.stringify(parseSemanticVersion(deprecatedInput) || [])}
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="values"
          >
            Values
          </label>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="values"
            name="values"
            type="text"
            defaultValue={field ? field.values : ""}
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="example"
          >
            Example
          </label>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="example"
            name="example"
            type="txt"
            defaultValue={field ? field.example : ""}
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <input
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            id="description"
            name="description"
            type="text"
            defaultValue={field ? field.description : ""}
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full px-3">
          {/* If there's a stored file and no new uploaded file from the FileUploader, show a visible text input.
        The user can clear this field to remove the file. */}
          {field?.uploadedFile && !uploadedFile && (
            <div className="mt-2">
              <label
                htmlFor="storedFile"
                className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
              >
                Currently Stored File (delete to remove or upload a new one to
                replace):
              </label>
              <input
                type="text"
                id="storedFile"
                name="uploadedFile"
                defaultValue={field.uploadedFile}
                className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
                placeholder="Clear to delete file"
              />
            </div>
          )}
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="fileUpload"
          >
            File Upload
          </label>

          <div className="w-full">
            <FileUploader ofid={ofid} bgColor={bgColor} />
          </div>

          {/* Hidden input to capture uploaded file metadata */}
          {uploadedFile?.filename && (
            <input
              type="hidden"
              id="fileUpload"
              name="uploadedFile"
              value={uploadedFile.filename}
            />
          )}
        </div>
      </div>
    </Form>
  );
}
