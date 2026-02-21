import { api } from "@/shared/services/axios";
import type {
  TenantMember,
  TenantMemberPatchPayload,
  TenantMemberUpsertPayload,
} from "@/features/settings/types/settings.types";
import type { ApiError } from "@/shared/types/http.types";

type Envelope<T> = {
  ok?: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown };
};

const unwrap = <T>(payload: Envelope<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    const envelope = payload as Envelope<T>;
    if (envelope.ok === false) {
      throw {
        message: envelope.error?.message ?? "Request failed",
        code: envelope.error?.code,
        details: { error: envelope.error },
      } satisfies ApiError;
    }
    return envelope.data as T;
  }

  return payload as T;
};

export const getTenantMembers = async (): Promise<TenantMember[]> => {
  const response = await api.get<Envelope<TenantMember[]> | TenantMember[]>(
    "/tenant/members",
  );
  return unwrap(response.data);
};

export const assignTenantMember = async (
  payload: TenantMemberUpsertPayload,
): Promise<TenantMember> => {
  const response = await api.post<Envelope<TenantMember> | TenantMember>(
    "/tenant/members",
    payload,
  );
  return unwrap(response.data);
};

export const updateTenantMember = async (
  membershipId: string,
  payload: TenantMemberPatchPayload,
): Promise<TenantMember> => {
  const response = await api.patch<Envelope<TenantMember> | TenantMember>(
    `/tenant/members/${membershipId}`,
    payload,
  );
  return unwrap(response.data);
};

export const deleteTenantMember = async (
  membershipId: string,
): Promise<{ membershipId: string }> => {
  const response = await api.delete<
    Envelope<{ membershipId: string }> | { membershipId: string }
  >(`/tenant/members/${membershipId}`);
  return unwrap(response.data);
};
