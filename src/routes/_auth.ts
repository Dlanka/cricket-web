import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "../features/auth/store/authStore";
import { useAuthzStore } from "@/features/authz/store/authzStore";
import type { PermissionAction } from "@/features/authz/types/authz.types";
import { hasPermission, resolvePermissionsForRole } from "@/features/authz/utils/permissions";

export const ensureAuthResolved = async () => {
  const { status, refreshMe } = useAuthStore.getState();
  if (status === "unknown") {
    await refreshMe();
  }
  return useAuthStore.getState().status;
};

export const requireAuthed = async () => {
  const status = await ensureAuthResolved();
  if (status === "guest") {
    throw redirect({ to: "/login" });
  }
  return status;
};

export const requireAction = async (action: PermissionAction) => {
  await requireAuthed();
  const authState = useAuthStore.getState();
  const authzState = useAuthzStore.getState();

  if (authzState.status !== "ready") {
    await authzState.load();
  }

  const permissions = resolvePermissionsForRole(
    authState.role,
    useAuthzStore.getState().permissions,
  );

  if (!hasPermission(permissions, action)) {
    throw redirect({ to: "/forbidden" });
  }
};

export const redirectIfAuthed = async () => {
  const status = await ensureAuthResolved();
  if (status === "authed") {
    throw redirect({ to: "/dashboard" });
  }
  return status;
};
