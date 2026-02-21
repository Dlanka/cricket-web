export type AuthStatus = "unknown" | "authed" | "guest";
export type UserRole = "ADMIN" | "SCORER" | "VIEWER";

export type UserSummary = {
  id: string;
  name?: string;
  email?: string;
  fullName?: string;
};

export type TenantSummary = {
  id: string;
  name?: string;
  role?: string;
};

export type MeResponse = {
  user: UserSummary;
  tenant: TenantSummary | null;
  role: UserRole;
  isOwner: boolean;
};

export type MeApiResponse = {
  ok: boolean;
  data: MeResponse;
};

export type LoginResponse =
  | { mode: "LOGGED_IN" }
  | {
      mode: "SELECT_TENANT";
      loginSessionToken: string;
      tenants: { tenantId: string; tenantName: string; role: string }[];
    };

export type SignupResponse = {
  mode: "LOGGED_IN";
  accessToken?: string;
  user: UserSummary;
  tenant: TenantSummary | null;
  role: UserRole;
};

export type LoginApiResponse = {
  ok: boolean;
  data: LoginResponse;
};

export type SignupApiResponse = {
  ok: boolean;
  data: SignupResponse;
};

export type SelectTenantResponse = {
  mode: "LOGGED_IN";
};

export type SelectTenantApiResponse = {
  ok: boolean;
  data: SelectTenantResponse;
};
