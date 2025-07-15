import { create } from "zustand";

export const useRecordStore = create((set, get) => ({
  listParams: {
    fields: [],
    currentPage: 0,
    currentPageSize: 0,
    currentSorting: [],
    currentFilter: "",
    currentRecord: 0,
  },

  setListParams: (params) => {
    set({ listParams: { ...params } });
  },
  currentListItems: [],
  setCurrentListItems: (items) => {
    set({ currentListItems: items });
  },

  setFields: (fields) => set({ fields }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setCurrentPageSize: (pageSize) => set({ currentPageSize: pageSize }),
  setCurrentSorting: (sorting) => set({ currentSorting: sorting }),
  setCurrentFilter: (filter) => set({ currentFilter: filter }),
  setCurrentRecord: (record) => set({ currentRecord: record }),
}));
