// TODO - Add more filtering options
// TODO - Add export functionality

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";

import DebouncedInput from "./DebouncedInput";
import { SearchIcon } from "../Icons/Icons";
import { useLoaderData, Link } from "react-router";
import { useAuthStore } from "../store/authStore";
import { useRecordStore } from "../store/recordStore";

const defaultPageSize = 10;

const RecordList = () => {
  const columnHelper = createColumnHelper();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const columns = [
    columnHelper.display({
      id: "actions",
      header: isAuthenticated ? (
        <Link
          className="py-0 px-2 float-right mr-0 text-center text-cyan-900 font-bold text-lg border-2 border-gray-500 bg-gray-300 hover:bg-gray-500 hover:text-white rounded-lg transition duration-300"
          to="create"
        >
          New
        </Link>
      ) : (
        <span></span>
      ),
      cell: ({ row }) => <ShowButton row={row} />,
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
      enableSorting: false,
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
      enableSorting: false,
      size: 400,
    }),
    columnHelper.accessor("linkReference", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Reference",
      enableSorting: false,
      size: 400,
    }),
    columnHelper.accessor("introduced", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "In",
      size: 150,
    }),
    columnHelper.accessor("depricated", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Out",
      size: 400,
    }),
    columnHelper.accessor("values", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Values",
      enableSorting: false,
      size: 120,
    }),
    columnHelper.accessor("example", {
      cell: (info) => <span>{info.getValue()}</span>,
      header: "Example",
      enableSorting: false,
      size: 120,
    }),
  ];

  // This gathers the record's id and sends it to the react-router
  const ShowButton = ({ row }) => {
    const _id = `${row.original._id}`;
    return (
      <Link
        className="py-0 px-2 float-right mr-0 text-center text-cyan-900 font-normal text-base border-2 border-cyan-900 bg-white hover:bg-gray-300 hover:text-gray-800 rounded-lg transition duration-300"
        to={_id}
      >
        Show
      </Link>
    );
  };

  // Retrieve all records from the database
  const data = useLoaderData();

  // Initialize global filter state
  const initialFilter = useRecordStore((state) => state.currentFilter);
  const [globalFilter, setGlobalFilter] = useState(initialFilter);

  // Retrieve initial fields array, page index, page size, sorting and record index from Zustand store
  const fields = useRecordStore((state) => state.fields) || [];

  const initialPage = useRecordStore((state) => state.currentPage);
  const [pageIndex, setPageIndex] = useState(
    isNaN(initialPage) || initialPage < 0 ? 0 : initialPage
  );

  const initialPageSize = useRecordStore((state) => state.currentPageSize);
  const [pageSize, setPageSize] = useState(
    isNaN(initialPageSize) || initialPageSize <= 0
      ? defaultPageSize
      : initialPageSize
  );

  const initialSorting = useRecordStore((state) => state.currentSorting) || [];
  const [sorting, setSorting] = useState(initialSorting);

  const initialRecord = useRecordStore((state) => state.currentRecord);
  const [record, setRecord] = useState(
    isNaN(initialRecord) || initialRecord < 0 ? 0 : initialRecord
  );

  const recalculatedPageIndex = Math.floor(record / pageSize) || 0; // Calculate the page index based on the record index and page size
  useEffect(() => {
    if (recalculatedPageIndex !== pageIndex) {
      setPageIndex(recalculatedPageIndex);
    }
  }, []);

  //

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filteredAndSortedData = table.getPrePaginationRowModel().rows;
  const currentListItems = filteredAndSortedData.map((row) => row.original);

  // Update page index, page size, sorting and global filter in global store whenever they change
  // Zustand setters
  const setFields = useRecordStore((state) => state.setFields);
  const setCurrentPage = useRecordStore((state) => state.setCurrentPage);
  const setCurrentPageSize = useRecordStore(
    (state) => state.setCurrentPageSize
  );
  const setCurrentSorting = useRecordStore((state) => state.setCurrentSorting);
  const setCurrentFilter = useRecordStore((state) => state.setCurrentFilter);

  // Store data and table state in the global store
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setFields(currentListItems);
    }
    setCurrentPage(table.getState().pagination.pageIndex);
    setCurrentPageSize(table.getState().pagination.pageSize);
    setCurrentSorting(
      Array.isArray(table.getState().sorting) ? table.getState().sorting : []
    );
    setCurrentFilter(globalFilter);
  }, [
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    table.getState().sorting,
    table.getState().globalFilter,
  ]);

  // console.log("currentListItems", currentListItems);
  // console.log("fields", fields);
  console.log("pageIndex", pageIndex);
  // console.log("pageSize", pageSize);
  // console.log("sorting", sorting);
  // console.log("globalFilter", globalFilter);
  // console.log("record", record);

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
                            style={
                              header.column.columnDef.size
                                ? { width: header.column.columnDef.size }
                                : {}
                            }
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
                            {header.column.getCanSort() && (
                              <button
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <ArrowsUpDownIcon
                                  className="h-6 w-6 text-white relative"
                                  style={{ top: "6px" }}
                                />
                              </button>
                            )}
                            {
                              {
                                asc: "🔼",
                                desc: "🔽",
                              }[header.column.getIsSorted()]
                            }
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
                        <td colSpan={12}>No Record Found!</td>
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

          <span className="flex items-center gap-1 ">
            {/*  | Go to: */}
            <input
              type="number"
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border text-right rounded w-14 bg-transparent"
            />{" "}
            of {table.getPageCount()}
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
