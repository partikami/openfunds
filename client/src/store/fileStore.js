import { create } from "zustand";

export const useFileStore = create((set, get) => ({
  uploadedFile: null,

  setUploadedFile: (fileData) => set({ uploadedFile: fileData }),
}));
