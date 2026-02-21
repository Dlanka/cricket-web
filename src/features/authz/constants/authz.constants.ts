import type { UserRole } from "@/features/auth/types/authTypes";
import type { PermissionAction } from "@/features/authz/types/authz.types";

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  ADMIN: ["*"],
  SCORER: ["roster.manage", "match.start", "score.write", "bowler.change"],
  VIEWER: [],
};
