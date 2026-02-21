export type TournamentType = "LEAGUE" | "KNOCKOUT" | "LEAGUE_KNOCKOUT";

export type PermissionCode =
  | "*"
  | "tournament.manage"
  | "fixture.generate"
  | "roster.manage"
  | "match.start"
  | "score.write"
  | "bowler.change";

export type AppSettings = {
  tenantId: string;
  organization: {
    tenantName: string;
    timezone: string;
    locale: string;
    dateFormat: string;
    logoUrl?: string;
  };
  tournamentDefaults: {
    defaultType: TournamentType;
    defaultOversPerInnings: number;
    defaultBallsPerOver: number;
    defaultQualificationCount: number;
    points: {
      win: number;
      tie: number;
      noResult: number;
      loss: number;
    };
  };
  matchRules: {
    allowUndo: boolean;
    maxUndoWindowSec: number;
    lockRosterAfterStart: boolean;
    lockMatchConfigAfterStart: boolean;
    requireBothRostersBeforeStart: boolean;
  };
  permissions: {
    ADMIN: PermissionCode[];
    SCORER: PermissionCode[];
    VIEWER: PermissionCode[];
  };
  createdAt: string;
  updatedAt: string;
};

export type AppSettingsPatch = {
  organization?: {
    tenantName?: string;
    timezone?: string;
    locale?: string;
    dateFormat?: string;
    logoUrl?: string | null;
  };
  tournamentDefaults?: {
    defaultType?: TournamentType;
    defaultOversPerInnings?: number;
    defaultBallsPerOver?: number;
    defaultQualificationCount?: number;
    points?: {
      win?: number;
      tie?: number;
      noResult?: number;
      loss?: number;
    };
  };
  matchRules?: {
    allowUndo?: boolean;
    maxUndoWindowSec?: number;
    lockRosterAfterStart?: boolean;
    lockMatchConfigAfterStart?: boolean;
    requireBothRostersBeforeStart?: boolean;
  };
  permissions?: {
    ADMIN?: PermissionCode[];
    SCORER?: PermissionCode[];
    VIEWER?: PermissionCode[];
  };
};

export type TenantMemberRole = "ADMIN" | "SCORER" | "VIEWER";
export type TenantMemberStatus = "ACTIVE" | "DISABLED";
export type TenantUserStatus = "ACTIVE" | "BLOCKED";

export type TenantMember = {
  membershipId: string;
  tenantId: string;
  role: TenantMemberRole;
  status: TenantMemberStatus;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    status: TenantUserStatus;
  };
};

export type TenantMemberUpsertPayload = {
  email: string;
  role: TenantMemberRole;
  status: TenantMemberStatus;
};

export type TenantMemberPatchPayload = {
  role?: TenantMemberRole;
  status?: TenantMemberStatus;
};
