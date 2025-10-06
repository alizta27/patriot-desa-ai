import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface GlobalState {
  isAppLoading: boolean;
  isSidebarOpen: boolean;
  modal: {
    name: string | null; // e.g. 'upgrade', 'confirmDelete'
    data?: unknown;
  } | null;

  setAppLoading: (loading: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;
}

export const useGlobalStore = create<GlobalState>()(
  devtools((set, get) => ({
    isAppLoading: false,
    isSidebarOpen: false,
    modal: null,

    setAppLoading: (loading) => set({ isAppLoading: loading }),
    openSidebar: () => set({ isSidebarOpen: true }),
    closeSidebar: () => set({ isSidebarOpen: false }),
    toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),

    openModal: (name, data) => set({ modal: { name, data } }),
    closeModal: () => set({ modal: null }),
  }))
);

export default useGlobalStore;
