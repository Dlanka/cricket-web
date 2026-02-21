import { api } from "@/shared/services/axios";
import type { ApiError } from "@/shared/types/http.types";
import type { TournamentStatsResponse } from "@/features/tournaments/types/tournamentStats.types";

type ApiEnvelope<T> = {
  ok?: boolean;
  success?: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown };
};

const unwrap = <T>(payload: ApiEnvelope<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (envelope.ok === false || envelope.success === false) {
      const err: ApiError = {
        message: envelope.error?.message ?? "Request failed",
        details: { error: envelope.error },
      };
      throw err;
    }
    return envelope.data as T;
  }
  return payload as T;
};

export const getTournamentStats = async (
  tournamentId: string,
): Promise<TournamentStatsResponse> => {
  try {
    const response = await api.get<
      ApiEnvelope<TournamentStatsResponse> | TournamentStatsResponse
    >(`/tournaments/${tournamentId}/stats`);
    return unwrap(response.data);
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 400) {
      throw { ...apiError, message: "Invalid tournament id." } satisfies ApiError;
    }
    if (apiError.status === 404) {
      throw { ...apiError, message: "Tournament stats not found." } satisfies ApiError;
    }
    if (apiError.status) throw apiError;
    throw {
      message: "Unable to load tournament stats.",
      details: apiError.details,
    } satisfies ApiError;
  }
};

