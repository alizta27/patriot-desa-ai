import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type PlanType = "free" | "premium";

export interface PlanSelection {
  plan: PlanType;
  // Optional metadata to support upgrade/changes UX
  startedAt?: string; // ISO string when user began selection
}

export interface PlanState {
  userId: string | null;
  currentPlan: PlanType; // server truth via React Query; store caches for quick access
  isExpired: boolean;
  expiry: string | null; // ISO date

  // Transient UI flow for choosing/changing plan
  selectedPlan: PlanSelection | null;
  isUpgrading: boolean; // while requesting payment token / redirecting

  setUserId: (userId: string | null) => void;
  setServerStatus: (status: {
    plan: PlanType;
    expired: boolean;
    expiry: string | null;
  }) => void;

  selectPlan: (plan: PlanType) => void;
  clearSelection: () => void;
  setUpdatePlan: (plan: PlanType) => void;

  beginUpgrade: () => void;
  endUpgrade: () => void;
}

export const usePlanStore = create<PlanState>()(
  devtools((set) => ({
    userId: null,
    currentPlan: "free",
    isExpired: false,
    expiry: null,

    selectedPlan: null,
    isUpgrading: false,

    setUserId: (userId) => set({ userId }),

    setUpdatePlan: (plan: PlanType) => set({ currentPlan: plan }),

    setServerStatus: ({ plan, expired, expiry }) =>
      set({ currentPlan: plan, isExpired: expired, expiry }),

    selectPlan: (plan) =>
      set({ selectedPlan: { plan, startedAt: new Date().toISOString() } }),

    clearSelection: () => set({ selectedPlan: null }),

    beginUpgrade: () => set({ isUpgrading: true }),
    endUpgrade: () => set({ isUpgrading: false }),
  }))
);

export default usePlanStore;
