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
import { useNavigate, NavLink } from "react-router-dom";

const RecordList = () => {
  const columnHelper = createColumnHelper();

  const columns = [
    /*     columnHelper.accessor("_id", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "_id",
      size: 120,
    }), */
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
    columnHelper.accessor("example", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Example",
      size: 120,
    }),
    columnHelper.accessor("tags", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Tags",
      size: 400,
    }),
    columnHelper.display({
      id: "actions",
      header: (
        <NavLink
          className="text-white bg-green-700 hover:bg-green-800 border-none 
    focus:outline-none focus:ring-2 focus:ring-blue600 font-normal rounded-lg text-sm px-3 py-0.2 mb-0 me-0"
          to="/create"
        >
          New
        </NavLink>
      ),
      cell: ({ row }) => <EditButton row={row} />,
      size: 100,
    }),
  ];

  const EditButton = ({ row }) => {
    const navigate = useNavigate();

    const handleEdit = () => {
      // navigate(`/edit/${row.original._id}`);
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

  const [data, setData] = useState([]);

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
  }, []);

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
      <div className="p-2 max-w-5xl mx-auto text-black fill-gray-600">
        <div className="flex justify-between mb-2">
          <div className="w-full flex items-center gap-1">
            <SearchIcon />
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
              className="p-2 bg-transparent outline-none border-b-2 w-1/5 focus:w-1/3 duration-300 border-gray-600"
              placeholder="Search all columns..."
            />
          </div>
          {/* <DownloadBtn data={data} fileName={"peoples"} /> */}
        </div>
        <div className="mt-5 flex flex-col">
          {/* <div className="-my-2 mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto"> */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div>
                {/* <table className="border border-gray-700 w-screen text-left"> */}
                <table className="min-w-full text-left">
                  <thead className="bg-slate-500">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            /* className={
                              (header.id === "tags"
                                ? `hidden lg:table-cell`
                                : "") + `  px-3.5 py-2 lg:px-6 xl:px-8`
                            } */
                            className={`px-3.5 py-2 lg:px-6 xl:px-8 ${
                              header.id === "tags" ? "hidden lg:table-cell" : ""
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
                              className={`px-3.5 py-2 lg:px-6 xl:px-8 ${
                                cell.id.slice(-4) === "tags"
                                  ? "hidden lg:table-cell"
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

          <span className="flex items-center gap-1">
            <div>Page</div>
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
              className="border p-1 rounded w-16 bg-transparent"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="p-2 bg-transparent"
          >
            {[10, 30, 50, 100].map((pageSize) => (
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
