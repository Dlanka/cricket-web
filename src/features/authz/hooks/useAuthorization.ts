import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthzStore } from "@/features/authz/store/authzStore";
import type { PermissionAction } from "@/features/authz/types/authz.types";
import { hasPermission, resolvePermissionsForRole } from "@/features/authz/utils/permissions";

export const useAuthorization = () => {
  const { role: authRole, status: authStatus } = useAuth();
  const authz = useAuthzStore(
    useShallow((state) => ({
      status: state.status,
      permissions: state.permissions,
      capabilities: state.capabilities,
      load: state.load,
    })),
  );

  const effectivePermissions = resolvePermissionsForRole(authRole, authz.permissions);

  const can = (action: PermissionAction) => {
    const capability = authz.capabilities?.[action];
    if (typeof capability === "boolean") return capability;
    return hasPermission(effectivePermissions, action);
  };

  return {
    authStatus,
    authzStatus: authz.status,
    permissions: effectivePermissions,
    capabilities: authz.capabilities,
    can,
    loadAuthz: authz.load,
  };
};
