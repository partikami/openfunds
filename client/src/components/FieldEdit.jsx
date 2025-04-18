import { Form, useNavigate } from "react-router";

export default function FieldEdit({ method, field }) {
  const navigate = useNavigate();

  function handleCancel() {
    navigate("..");
  }

  return (
    <Form method={method}>
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
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
            id="ofid"
            name="ofid"
            type="text"
            required
            defaultValue={field ? field.ofid : ""}
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
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
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
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
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
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
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
            Tags
          </label>
          <input
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
            id="tags"
            name="tags"
            type="text"
            defaultValue={field ? field.tags : ""}
          />
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
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
            id="linkReference"
            name="linkReference"
            type="text"
            defaultValue={field ? field.linkReference : ""}
          />
        </div>

        <div className="w-full md:w-1/3 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="introduced"
          >
            Introduced in Version
          </label>
          <input
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
            id="introduced"
            name="introduced"
            type="text"
            defaultValue={field ? field.introduced : ""}
          />
        </div>

        <div className="w-full md:w-1/3 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="depricated"
          >
            Valid until Version
          </label>
          <input
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
            id="depricated"
            name="depricated"
            type="text"
            defaultValue={field ? field.depricated : ""}
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
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
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
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
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
            className="appearance-none block w-full min-h-12 bg-gray-200 text-gray-700 border border-gray-700 rounded py-3 px-4 mb-3 leading-tight"
            id="description"
            name="description"
            type="text"
            defaultValue={field ? field.description : ""}
          />
        </div>
      </div>
    </Form>
  );
}
