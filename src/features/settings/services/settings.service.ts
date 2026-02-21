import { api } from "@/shared/services/axios";
import type { ApiError } from "@/shared/types/http.types";
import type { AppSettings, AppSettingsPatch } from "@/features/settings/types/settings.types";

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

export const getAppSettings = async (): Promise<AppSettings> => {
  const response = await api.get<Envelope<AppSettings> | AppSettings>("/settings/app");
  return unwrap(response.data);
};

export const patchAppSettings = async (
  payload: Partial<AppSettingsPatch>,
): Promise<AppSettings> => {
  const response = await api.patch<Envelope<AppSettings> | AppSettings>(
    "/settings/app",
    payload,
  );
  return unwrap(response.data);
};

