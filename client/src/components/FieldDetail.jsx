// TODO - Add pagination functionality to detail page

import { useEffect } from "react";
import { Link, Form, useNavigate } from "react-router";

import { useAuthStore } from "../store/authStore";
import { useRecordStore } from "../store/recordStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050"; // Fallback for local dev

export default function FieldDetail({ method, field }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  // Get everything from store
  const fields = useRecordStore((state) => state.fields);

  // Get current record
  const currentRecord = fields.findIndex((f) => f && f._id === field._id);
  const getId = (idx) => fields[idx]?._id;

  // Zustand setters
  const setCurrentRecord = useRecordStore((state) => state.setCurrentRecord);

  // Navigation handlers
  const goToFirst = () => navigate(`../${getId(0)}`);
  const goToPrev = () => navigate(`../${getId(currentRecord - 1)}`);
  const goToNext = () => navigate(`../${getId(currentRecord + 1)}`);
  const goToLast = () => navigate(`../${getId(fields.length - 1)}`);

  // Store current record in Zustand store
  useEffect(() => {
    setCurrentRecord(currentRecord);
  }, [currentRecord]);

  const bgColor = field?.tags?.includes("Under Review")
    ? "bg-yellow-100"
    : "bg-gray-200";

  const remark = field?.tags?.includes("Under Review")
    ? " (This field is under review and may differ from the official version on www.openfunds.org)"
    : "";

  return (
    <article>
      <div className="flow-root mt-12 mb-12">
        {isAuthenticated ? (
          <>
            <Link
              to="edit"
              className="py-2 px-4 float-right text-center text-gray-100 font-bold text-lg border-2 border-black bg-cyan-900 hover:bg-cyan-800 hover:text-white rounded-lg transition duration-300"
            >
              Edit
            </Link>
            <Form method={method}>
              <button
                type="submit"
                className="py-2 px-4 float-right mr-4 text-center text-gray-100 font-bold text-lg border-2 border-black bg-cyan-900 hover:bg-cyan-800 hover:text-white rounded-lg transition duration-300"
              >
                Delete
              </button>
            </Form>
          </>
        ) : (
          <span></span>
        )}

        <Link
          to=".."
          className="py-2 px-3 float-right mr-4 text-center text-cyan-900 font-bold text-lg border-2 border-cyan-900 bg-white hover:bg-gray-300 hover:text-gray-800 rounded-lg transition duration-300"
        >
          Back
        </Link>
      </div>
      <div className="mb-8 flow root flex flex-wrap -mx-3">
        <div className="w-full max-w-48 md:w-3/12 px-3">
          <div className="block tracking-wide text-black text-2xl font-bold mb-2">
            {field.ofid}
          </div>
          {/* <div className="appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight">
            {field.ofid}bg
          </div> */}
        </div>

        <div className="w-full md:w-9/12 px-3">
          <div className="block tracking-wide text-black text-2xl font-bold mb-2">
            {field.fieldName} <span className="text-red-500">{remark}</span>
          </div>
          {/* <div className="appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight">
            {field.fieldName}
          </div> */}
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full md:w-1/3 px-3">
          <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
            Data Type
          </div>
          <div
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
          >
            {field.dataType}
          </div>
        </div>

        <div className="w-full md:w-1/3 px-3">
          <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
            Level
          </div>
          <div
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
          >
            {field.level}
          </div>
        </div>

        <div className="w-full md:w-1/3 px-3">
          <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
            Tags
          </div>
          <select
            multiple
            className={`appearance-none block w-full ${bgColor} text-gray-700 border border-gray-700 rounded py-1 px-4 mb-3 leading-tight max-h-12 overflow-auto`}
          >
            {field.tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full md:w-1/3 px-3">
          <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
            Link Reference
          </div>
          <div
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
          >
            {field.linkReference}
          </div>
        </div>

        <div className="w-full md:w-1/3 px-3">
          <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
            Introduced in Version
          </div>
          <div
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
          >
            {/* Show array in a user readable form */}
            {Array.isArray(field.introduced)
              ? field.introduced
                  .filter((v) => v !== null && v !== undefined)
                  .join(".")
              : field.introduced}
          </div>
        </div>

        <div className="w-full md:w-1/3 px-3">
          <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
            Valid until Version
          </div>
          <div
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
          >
            {/* Show array in a user readable form */}
            {Array.isArray(field.deprecated)
              ? field.deprecated
                  .filter((v) => v !== null && v !== undefined)
                  .join(".")
              : field.deprecated}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full px-3">
          <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
            Values
          </div>
          <div
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
          >
            {field.values}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full px-3">
          <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
            Example
          </div>
          <div
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
          >
            {field.example}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap -mx-3">
        <div className="w-full px-3">
          <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
            Description
          </div>
          <div
            className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
          >
            {field.description}
          </div>
        </div>
      </div>
      {field.uploadedFile && (
        <div className="flex flex-wrap -mx-3">
          <div className="w-full px-3">
            <div className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2">
              Image
            </div>
            <div
              className={`appearance-none block w-full min-h-12 ${bgColor} text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight`}
            >
              <img
                src={`${API_BASE_URL}/uploads/${field.uploadedFile}`}
                alt={field.uploadedFile}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* pagination */}
      <div className="flex items-center justify-end mt-2 gap-2">
        <button
          onClick={goToFirst}
          disabled={currentRecord <= 0}
          className="p-1 border border-gray-300 px-2 disabled:opacity-30"
        >
          {"<<"}
        </button>
        <button
          onClick={goToPrev}
          disabled={currentRecord <= 0}
          className="p-1 border border-gray-300 px-2 disabled:opacity-30"
        >
          {"<"}
        </button>
        <button
          onClick={goToNext}
          disabled={currentRecord >= fields.length - 1}
          className="p-1 border border-gray-300 px-2 disabled:opacity-30"
        >
          {">"}
        </button>
        <button
          onClick={goToLast}
          disabled={currentRecord >= fields.length - 1}
          className="p-1 border border-gray-300 px-2 disabled:opacity-30"
        >
          {">>"}
        </button>
      </div>
    </article>
  );
}
