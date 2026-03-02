
import { create } from 'zustand'

type DialogStore = {
  isCreateComplaintOpen: boolean
  openCreateComplaint: () => void
  closeCreateComplaint: () => void
}

export const useDialogStore = create<DialogStore>((set) => ({
  isCreateComplaintOpen: false,
  openCreateComplaint: () => set({ isCreateComplaintOpen: true }),
  closeCreateComplaint: () => set({ isCreateComplaintOpen: false }),
}))

type SidebarStore = {
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
    isMobileSidebarOpen: false,
    openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
    closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
}))


type PWAInstallStore = {
    isInstallDialogOpen: boolean;
    openInstallDialog: () => void;
    closeInstallDialog: () => void;
}

export const usePWAInstallStore = create<PWAInstallStore>((set) => ({
    isInstallDialogOpen: false,
    openInstallDialog: () => set({ isInstallDialogOpen: true }),
    closeInstallDialog: () => set({ isInstallDialogOpen: false }),
}))
