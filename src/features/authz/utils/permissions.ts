import type { UserRole } from "@/features/auth/types/authTypes";
import { DEFAULT_ROLE_PERMISSIONS } from "@/features/authz/constants/authz.constants";
import type { PermissionAction } from "@/features/authz/types/authz.types";

export const hasPermission = (
  permissions: PermissionAction[] | undefined,
  action: PermissionAction,
) => Boolean(permissions?.includes("*") || permissions?.includes(action));

export const resolvePermissionsForRole = (
  role: UserRole | null,
  permissions: PermissionAction[] | null,
) => {
  if (permissions?.length) return permissions;
  if (!role) return [];
  return DEFAULT_ROLE_PERMISSIONS[role];
};
