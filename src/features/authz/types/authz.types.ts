import type { UserRole } from "@/features/auth/types/authTypes";

export type PermissionAction =
  | "*"
  | "tournament.manage"
  | "fixture.generate"
  | "roster.manage"
  | "match.start"
  | "score.write"
  | "bowler.change";

export type EffectivePermissionsResponse = {
  tenantId: string;
  role: UserRole;
  permissions: PermissionAction[];
  version: number;
};

export type EffectivePermissionsApiResponse = {
  ok: boolean;
  data: EffectivePermissionsResponse;
};

export type CapabilitiesResponse = {
  actions: Record<PermissionAction, boolean>;
};

export type CapabilitiesApiResponse = {
  ok: boolean;
  data: CapabilitiesResponse;
};
