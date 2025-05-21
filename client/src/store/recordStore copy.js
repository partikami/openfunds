import { create } from "zustand";

export const useRecordStore = create((set) => ({
  fields: [],
  currentPage: 0,
  currentPageSize: 10,
  currentSorting: [],

  setFields: (fields) => set({ fields }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setCurrentPageSize: (pageSize) => set({ currentPageSize: pageSize }),
  setCurrentSorting: (sorting) => set({ currentSorting: sorting }),
}));
