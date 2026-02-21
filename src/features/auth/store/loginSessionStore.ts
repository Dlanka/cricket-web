import { create } from "zustand";
import type { TenantSummary } from "../types/authTypes";

type LoginSessionState = {
  loginSessionToken: string | null;
  tenants: TenantSummary[];
  setSession: (token: string, tenants: TenantSummary[]) => void;
  clearSession: () => void;
};

export const useLoginSessionStore = create<LoginSessionState>((set) => ({
  loginSessionToken: null,
  tenants: [],
  setSession: (loginSessionToken, tenants) =>
    set({ loginSessionToken, tenants }),
  clearSession: () => set({ loginSessionToken: null, tenants: [] }),
}));
