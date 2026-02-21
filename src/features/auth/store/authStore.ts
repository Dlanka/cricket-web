import { create } from "zustand";
import { getMe, logout as logoutRequest } from "../services/authService";
import { queryClient } from "@/lib/queryClient";
import type {
  AuthStatus,
  MeResponse,
  TenantSummary,
  UserRole,
  UserSummary,
} from "@/features/auth/types/authTypes";

type AuthState = {
  status: AuthStatus;
  user: UserSummary | null;
  tenant: TenantSummary | null;
  role: UserRole | null;
  isOwner: boolean | null;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  user: null,
  tenant: null,
  role: null,
  isOwner: null,
  refreshMe: async () => {
    try {
      const data: MeResponse = await getMe();
      set({
        status: "authed",
        user: data.user,
        tenant: data.tenant,
        role: data.role,
        isOwner: data.isOwner,
      });
    } catch {
      set({
        status: "guest",
        user: null,
        tenant: null,
        role: null,
        isOwner: null,
      });
    }
  },
  logout: async () => {
    await logoutRequest();
    queryClient.clear();
    set({
      status: "guest",
      user: null,
      tenant: null,
      role: null,
      isOwner: null,
    });
  },
}));
