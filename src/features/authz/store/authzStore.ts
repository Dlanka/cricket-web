import { create } from "zustand";
import type { PermissionAction } from "@/features/authz/types/authz.types";
import { getCapabilities, getMyPermissions } from "@/features/authz/services/authz.service";

type AuthzStatus = "idle" | "loading" | "ready" | "error";

type AuthzState = {
  status: AuthzStatus;
  tenantId: string | null;
  role: string | null;
  permissions: PermissionAction[] | null;
  capabilities: Record<string, boolean> | null;
  version: number | null;
  load: () => Promise<void>;
  clear: () => void;
};

export const useAuthzStore = create<AuthzState>((set) => ({
  status: "idle",
  tenantId: null,
  role: null,
  permissions: null,
  capabilities: null,
  version: null,
  load: async () => {
    set((state) => ({
      ...state,
      status: "loading",
    }));
    try {
      const [permissionsData, capabilitiesData] = await Promise.all([
        getMyPermissions(),
        getCapabilities().catch(() => null),
      ]);
      set({
        status: "ready",
        tenantId: permissionsData.tenantId,
        role: permissionsData.role,
        permissions: permissionsData.permissions,
        version: permissionsData.version,
        capabilities: capabilitiesData?.actions ?? null,
      });
    } catch {
      set((state) => ({
        ...state,
        status: "error",
        permissions: null,
        capabilities: null,
        tenantId: null,
        role: null,
        version: null,
      }));
    }
  },
  clear: () =>
    set({
      status: "idle",
      tenantId: null,
      role: null,
      permissions: null,
      capabilities: null,
      version: null,
    }),
}));
