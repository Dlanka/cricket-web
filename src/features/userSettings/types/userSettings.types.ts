import type { UserRole } from "@/features/auth/types/authTypes";

export type UserTheme = "light" | "dark" | "system";
export type AccountStatus = "ACTIVE" | "BLOCKED";
export type TenantStatus = "ACTIVE" | "DISABLED";
export type MembershipStatus = "ACTIVE" | "DISABLED";

export type MeSettings = {
  profile: {
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  preferences: {
    locale: string;
    timezone: string;
    dateFormat: string;
    theme: UserTheme;
    notifications: {
      email: boolean;
      inApp: boolean;
    };
  };
  account: {
    status: AccountStatus;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
  };
  tenantContext: {
    current: {
      id: string;
      name: string;
      role: UserRole;
      isOwner: boolean;
    };
    memberships: Array<{
      tenantId: string;
      tenantName: string;
      tenantStatus: TenantStatus;
      role: UserRole;
      membershipStatus: MembershipStatus;
    }>;
  };
  authorization: {
    permissions: string[];
    version: number;
  };
};

export type MeSettingsPatch = {
  profile?: {
    fullName?: string;
  };
  preferences?: {
    locale?: string;
    timezone?: string;
    dateFormat?: string;
    theme?: UserTheme;
    notifications?: {
      email?: boolean;
      inApp?: boolean;
    };
  };
};
