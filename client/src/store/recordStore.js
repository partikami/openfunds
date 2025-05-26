import { create } from "zustand";

export const useRecordStore = create((set, get) => ({
  listParams: {
    fields: [],
    currentPage: 0,
    currentPageSize: 0,
    currentSorting: [],
    currentRecord: 0,
    currentFilter: "",
  },

  setListParams: (params) => {
    set({ listParams: { ...params } });
    console.log("setListParams called. New listParams:", get().listParams);
  },
  currentListItems: [],
  setCurrentListItems: (items) => {
    set({ currentListItems: items });
    console.log(
      "setCurrentListItems called. New currentListItems length:",
      get().currentListItems.length
    );
  },

  setFields: (fields) => set({ fields }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setCurrentPageSize: (pageSize) => set({ currentPageSize: pageSize }),
  setCurrentSorting: (sorting) => set({ currentSorting: sorting }),
  setCurrentRecord: (record) => set({ currentRecord: record }),
  setCurrentFilter: (filter) => set({ currentFilter: filter }),
}));
