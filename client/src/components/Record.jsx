import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";

export default function Record() {
  const [form, setForm] = useState({
    ofid: "",
    fieldName: "",
    dataType: "",
    description: "",
    values: "",
    level: "",
    tags: "",
    example: "",
    linkReference: "",
    introduced: "",
    depricated: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const [isNew, setIsNew] = useState(true);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const id = params.id?.toString() || undefined;
      if (!id) return;
      setIsNew(false);
      const response = await fetch(
        `http://localhost:5050/record/${params.id.toString()}`
      );
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        return;
      }
      const record = await response.json();
      if (!record) {
        console.warn(`Record with id ${id} not found`);
        navigate("/");
        return;
      }
      setForm(record);
    }
    fetchData();
    return;
  }, [params.id, navigate]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  // This method will delete a record
  async function deleteRecord(id) {
    await fetch(`http://localhost:5050/record/${params.id.toString()}`, {
      method: "DELETE",
    });
    navigate("/");
    /*     const newRecords = records.filter((el) => el._id !== id);
    setRecords(newRecords) */
  }

  // This function will handle the submission
  async function onSubmit(e) {
    e.preventDefault();
    const field = { ...form };
    try {
      let response;
      if (isNew) {
        // This adds a new record by using POST to /record.
        response = await fetch("http://localhost:5050/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(field),
        });
      } else {
        // This updates a record by using PATCH to /record/:id.
        response = await fetch(`http://localhost:5050/record/${params.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(field),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("A problem occurred with your fetch operation: ", error);
    } finally {
      setForm({
        ofid: "",
        fieldName: "",
        dataType: "",
        description: "",
        values: "",
        level: "",
        tags: "",
        example: "",
        linkReference: "",
        introduced: "",
        depricated: "",
      });
      navigate("/");
    }
  }

  // This will display the form that takes input from the user.
  return (
    <>
      <h3 className="text-lg font-semibold p-4">
        Create/Update an openfunds field definition{" "}
      </h3>
      <form
        onSubmit={onSubmit}
        className="border rounded-lg overflow-hidden p-4"
      >
        <div className="gap-x-4 gap-y-2 border-b border-slate-900/10 pb-4">
          <div>
            <h2 className="mb-6 text-base font-semibold leading-7 text-slate-900">
              OFID, Field Name and the Description are required. OFID must be
              unique.
            </h2>
          </div>

          <div className="grid sm:grid-cols-12 gap-x-4 gap-y-2">
            {/* <div className="sm:col-span-4">
              <label
                htmlFor="_id"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                _id
              </label>
              <div className="box-border w-48">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="text"
                    name="_id"
                    id="_id"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="xxxxxx..."
                    value={form._id || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div> */}

            <div className="sm:col-span-4">
              <label
                htmlFor="ofid"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                OFID
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="ofid"
                    id="ofid"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="OF..xxxxxx"
                    value={form.ofid || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-8">
              <label
                htmlFor="fieldName"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Field Name
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="fieldName"
                    id="fieldName"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Name of the openfunds field"
                    value={form.fieldName || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="dataType"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Data Type
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="dataType"
                    id="dataType"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="String, Number, Boolean, ..."
                    value={form.dataType || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-8">
              <label
                htmlFor="values"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Values
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="values"
                    id="values"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Enter a possible value"
                    value={form.values || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="level"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Level
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="level"
                    id="level"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Shareclass, Fund, Umbrella, ..."
                    value={form.level || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-8">
              <label
                htmlFor="tags"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Tags
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Enter a possible value"
                    value={form.tags || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="linkReference"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Link Reference
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="linkReference"
                    id="linkReference"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Enter a possible value"
                    value={form.linkReference || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="introduced"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Introduced in Version
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="introduced"
                    id="introduced"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Version number when this field was shown for the first time"
                    value={form.introduced || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="depricated"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Valid until Version
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="depricated"
                    id="depricated"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Empty or version number when field was shown for the last time"
                    value={form.depricated || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-12">
              <label
                htmlFor="example"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Example
              </label>
              <div className="box-border min-w-fit">
                <div className="flex rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="example"
                    id="example"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Enter a possible value"
                    value={form.example || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-12">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-slate-900"
              >
                Description
              </label>
              <div className="box-border min-w-fit">
                <div className="flex min-h-[150px] rounded-md bg-white shadow-sm ring-1 ring-inset ring-slate-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <textarea
                    name="description"
                    id="description"
                    className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="Enter a description"
                    value={form.description || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flow-root">
          <div className="float-left">
            <NavLink className="mr-4 inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
              to="/"
            >
              Cancel
            </NavLink>
            <input
              className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
              type="submit"
              value="Save"
            />
          </div>
          <div className="float-right">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background bg-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-red-500 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
              onClick={() => deleteRecord(params.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
