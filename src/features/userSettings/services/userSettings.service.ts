import { api } from "@/shared/services/axios";
import type { ApiError } from "@/shared/types/http.types";
import type { MeSettings, MeSettingsPatch } from "@/features/userSettings/types/userSettings.types";

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

export const getMeSettings = async (): Promise<MeSettings> => {
  const response = await api.get<Envelope<MeSettings> | MeSettings>("/me/settings");
  return unwrap(response.data);
};

export const patchMeSettings = async (payload: MeSettingsPatch): Promise<MeSettings> => {
  const response = await api.patch<Envelope<MeSettings> | MeSettings>("/me/settings", payload);
  return unwrap(response.data);
};

export const patchMyPassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ changed: boolean }> => {
  const response = await api.patch<
    Envelope<{ changed: boolean }> | { changed: boolean }
  >("/me/password", payload);
  return unwrap(response.data);
};
