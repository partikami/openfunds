import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import DebouncedInput from "./DebouncedInput";
import { SearchIcon } from "../Icons/Icons";
import { useNavigate, useLoaderData, Link } from "react-router";

const RecordList = () => {
  const columnHelper = createColumnHelper();

  const columns = [
    /*     columnHelper.accessor("_id", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "_id",
      size: 120,
    }), */
    columnHelper.display({
      id: "actions",
      header: (
        <Link
          className="text-white bg-green-700 hover:bg-green-800 border-none 
        focus:outline-none focus:ring-2 focus:ring-blue600 font-normal rounded-lg text-sm px-3 py-0.2 mb-0 me-0"
          to="/create"
        >
          New
        </Link>
      ),
      cell: ({ row }) => <EditButton row={row} />,
      size: 100,
    }),
    columnHelper.accessor("ofid", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "OFID",
      size: 120,
    }),
    columnHelper.accessor("fieldName", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Field Name",
      size: 400,
    }),
    columnHelper.accessor("dataType", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Type",
      size: 150,
    }),
    columnHelper.accessor("level", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Level",
      size: 400,
    }),
    columnHelper.accessor("tags", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Tags",
      size: 400,
    }),
    columnHelper.accessor("linkReference", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Reference",
      size: 400,
    }),
    columnHelper.accessor("introduced", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "In",
      size: 400,
    }),
    columnHelper.accessor("depricated", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Out",
      size: 400,
    }),
    columnHelper.accessor("values", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Values",
      size: 120,
    }),
    columnHelper.accessor("example", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Example",
      size: 120,
    }),
  ];

  const EditButton = ({ row }) => {
    const navigate = useNavigate();

    const handleEdit = () => {
      navigate(`/edit/${row.original._id}`);
    };

    return (
      <button
        onClick={handleEdit}
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 border-none 
    focus:outline-none focus:ring-2 focus:ring-blue600 font-normal rounded-lg text-sm px-3 py-0.2 mb-0 me-0"
      >
        Edit
      </button>
    );
  };

  /* const [data, setData] = useState([]);

  // This method fetches the records from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5050/record");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []); */

  // This retrieves all records from the database
  const data = useLoaderData();

  /* if (data.isError) {
    return <p>{data.message}</p>;
  } */

  const [globalFilter, setGlobalFilter] = useState("");

  // This section displays the table with the individual records, the search field, pagination, etc.
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="p-2 mx-auto text-black fill-gray-600">
        <div className="flex justify-between mb-2">
          <div className="pt-12 w-full flex items-center gap-1">
            <SearchIcon />
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
              className="bg-transparent outline-none border-b-2 w-1/5 focus:w-1/3 duration-300 border-gray-600"
              placeholder="Search ..."
            />
          </div>
          {/* <DownloadBtn data={data} fileName={"peoples"} /> */}
        </div>
        <div className="mt-5 flex flex-col">
          {/* <div className="-my-2 mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto"> */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div>
                <table className="min-w-full text-left">
                  <thead className="bg-cyan-900 text-white">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className={`py-2 px-2 ${
                              header.id === "introduced"
                                ? "hidden sm:table-cell"
                                : ""
                            } ${
                              header.id === "example"
                                ? "hidden md:table-cell"
                                : ""
                            } ${
                              header.id === "level"
                                ? "hidden lg:table-cell"
                                : ""
                            } ${
                              header.id === "tags" ||
                              header.id === "linkReference"
                                ? "hidden xl:table-cell"
                                : ""
                            } ${
                              header.id.slice(-10) === "depricated" ||
                              header.id === "values"
                                ? "hidden 2xl:table-cell"
                                : ""
                            }`}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row, i) => (
                        <tr
                          key={row.id}
                          className={`${
                            i % 2 === 0 ? "bg-slate-100" : "bg-slate-300"
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={`py-1 px-2 ${
                                cell.id.slice(-10) === "introduced"
                                  ? "hidden sm:table-cell"
                                  : ""
                              } ${
                                cell.id.slice(-7) === "example"
                                  ? "hidden md:table-cell"
                                  : ""
                              } ${
                                cell.id.slice(-5) === "level"
                                  ? "hidden lg:table-cell"
                                  : ""
                              } ${
                                cell.id.slice(-4) === "tags" ||
                                cell.id.slice(-13) === "linkReference"
                                  ? "hidden xl:table-cell"
                                  : ""
                              } ${
                                cell.id.slice(-10) === "depricated" ||
                                cell.id.slice(-6) === "values"
                                  ? "hidden 2xl:table-cell"
                                  : ""
                              }`}
                            >
                              <div className="line-clamp-1">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr className="text-center h-32">
                        <td colSpan={12}>No Recoard Found!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-end mt-2 gap-2">
          <button
            onClick={() => {
              table.firstPage();
            }}
            disabled={!table.getCanPreviousPage()}
            className="p-1 border border-gray-300 px-2 disabled:opacity-30"
          >
            {"<<"}
          </button>
          <button
            onClick={() => {
              table.previousPage();
            }}
            disabled={!table.getCanPreviousPage()}
            className="p-1 border border-gray-300 px-2 disabled:opacity-30"
          >
            {"<"}
          </button>
          <button
            onClick={() => {
              table.nextPage();
            }}
            disabled={!table.getCanNextPage()}
            className="p-1 border border-gray-300 px-2 disabled:opacity-30"
          >
            {">"}
          </button>
          <button
            onClick={() => {
              table.lastPage();
            }}
            disabled={!table.getCanNextPage()}
            className="p-1 border border-gray-300 px-2 disabled:opacity-30"
          >
            {">>"}
          </button>
          <span className="flex items-center gap-1">
            <div>
              <span className="flex items-center gap-1"></span>{" "}
            </div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            | Go to page:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 text-right rounded w-16 bg-transparent"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="p-2 bg-transparent"
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default RecordList;

// This function is used in the client's router main.jsx
export async function recordListLoader() {
  const response = await fetch("http://localhost:5050/record");

  if (!response.ok) {
    // return {isError: true, message: 'Could not fetch data.'};
    // throw { message: "Could not fetch data." };
    // throw new Response(JSON.stringify({ message: 'From RecordList: Could not fetch data.' }), { status: 500 });
    // throw json({ message: 'From RecordList: Could not fetch data.'}, { status: 500 });
    throw new Response(JSON.stringify({ message: 'Could not fetch data.' }), { status: 500 });
  } else {
    return response;
  }
}
