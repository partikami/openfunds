import FloatingShape from "../components/FloatingShape";

const ToolsPage = () => {
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

        <form className="ml-2">
          <div className="flex flex-wrap gap-4">
            <fieldset className="border border-gray-100 w-32 pl-4 pb-2 rounded-lg">
              <legend className="text-lg font-semibold text-gray-100 mb-2">
                Format
              </legend>
              <input type="radio" id="JSON" name="format" value="JSON" />
              <label for="JSON" className="pl-2">
                JSON
              </label>
              <br />
              <input type="radio" id="CSV" name="format" value="CSV" />
              <label for="CSV" className="pl-2">
                CSV
              </label>
              <br />
              <input type="radio" id="HTML" name="format" value="HTML" />
              <label for="HTML" className="pl-2">
                HTML
              </label>
              <br />
              <input type="radio" id="PDF" name="format" value="PDF" />
              <label for="PDF" className="pl-2">
                PDF
              </label>
            </fieldset>
            <fieldset className="border border-gray-100 w-64 pl-4 pb-2 rounded-lg">
              <legend className="text-lg font-semibold text-gray-100 mb-2">
                Content
              </legend>
              <input
                type="radio"
                id="Current_public"
                name="content"
                value="Current_public"
              />
              <label for="Current_public" className="pl-2">
                Current public fields
              </label>
              <br />
              <input
                type="radio"
                id="Including_internal"
                name="content"
                value="Including_internal"
              />
              <label for="Including_internal" className="pl-2">
                Including internal fields
              </label>
              <br />
              <input type="radio" id="Next" name="content" value="Next" />
              <label for="Next" className="pl-2">
                Next version / under review
              </label>
            </fieldset>
            <button className="mt-4 border border-gray-100 w-32 h-36 rounded-lg text-2xl text-bold text-gray-100 hover:bg-gray-100 hover:text-cyan-900 transition duration-300">
              Export
            </button>
          </div>
        </form>

        <h2 className="text-3xl mt-10 text-white font-bold mb-5">Import</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <fieldset className="border border-gray-100 w-32 pl-4 pb-2 rounded-lg">
            <legend className="text-lg font-semibold text-gray-100 mb-2">
              Format
            </legend>
            <input type="radio" id="JSON" name="format" value="JSON" />
            <label for="JSON" className="pl-2">
              JSON
            </label>
            <br />
            <input type="radio" id="CSV" name="format" value="CSV" />
            <label for="CSV" className="pl-2">
              CSV
            </label>
          </fieldset>
          <fieldset className="border border-gray-100 w-64 pl-4 pb-2 rounded-lg">
            <legend className="text-lg font-semibold text-gray-100 mb-2">
              Method
            </legend>
            <input type="radio" id="Append" name="content" value="Append" />
            <label for="Append" className="pl-2">
              Append, ignoring existing
            </label>
            <br />
            <input
              type="radio"
              id="Overwrite"
              name="content"
              value="Overwrite"
            />
            <label for="Overwrite" className="pl-2">
              Append, overwriting existing
            </label>
            <br />
            <input type="radio" id="Rebuild" name="content" value="Rebuild" />
            <label for="Rebuild" className="pl-2">
              Flush all and import
            </label>
          </fieldset>
          <button className="mt-4 border border-gray-100 w-32 h-36 rounded-lg text-2xl text-bold text-gray-100 hover:bg-gray-100 hover:text-cyan-900 transition duration-300">
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
