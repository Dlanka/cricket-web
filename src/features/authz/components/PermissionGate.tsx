import type { ReactNode } from "react";
import type { PermissionAction } from "@/features/authz/types/authz.types";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";

type PermissionGateProps = {
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
};

export const PermissionGate = ({
  action,
  children,
  fallback = null,
}: PermissionGateProps) => {
  const { can } = useAuthorization();
  if (!can(action)) return <>{fallback}</>;
  return <>{children}</>;
};
