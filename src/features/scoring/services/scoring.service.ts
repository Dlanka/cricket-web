import { api } from "@/shared/services/axios";
import type { ApiError } from "@/shared/types/http.types";
import type {
  ApiEnvelope,
  BattersResponse,
  BowlersResponse,
  ChangeBowlerRequest,
  ChangeBowlerResponse,
  EventsResponse,
  MatchScoreResponse,
  OversResponse,
  StartSecondInningsRequest,
  StartSecondInningsResponse,
} from "@/features/scoring/types/scoring.types";

const unwrapEnvelope = <T>(payload: ApiEnvelope<T> | T): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "ok" in payload &&
    typeof (payload as { ok?: unknown }).ok === "boolean"
  ) {
    const envelope = payload as ApiEnvelope<T>;
    if (!envelope.ok) {
      const apiError: ApiError = {
        code: envelope.error?.code,
        message: envelope.error?.message ?? "Request failed",
        details: envelope.error?.details ?? { error: envelope.error },
      };
      throw apiError;
    }
    return envelope.data as T;
  }
  return payload as T;
};

export const getMatchScore = async (matchId: string): Promise<MatchScoreResponse> => {
  const response = await api.get<ApiEnvelope<MatchScoreResponse>>(
    `/matches/${matchId}/score`,
  );
  return unwrapEnvelope(response.data);
};

export const getBatters = async (inningsId: string): Promise<BattersResponse> => {
  const response = await api.get<ApiEnvelope<BattersResponse>>(
    `/innings/${inningsId}/batters`,
  );
  return unwrapEnvelope(response.data);
};

export const getBowlers = async (inningsId: string): Promise<BowlersResponse> => {
  const response = await api.get<ApiEnvelope<BowlersResponse>>(
    `/innings/${inningsId}/bowlers`,
  );
  return unwrapEnvelope(response.data);
};

export const getOvers = async (
  inningsId: string,
  limit = 10,
): Promise<OversResponse> => {
  const response = await api.get<ApiEnvelope<OversResponse>>(
    `/innings/${inningsId}/overs`,
    { params: { limit } },
  );
  return unwrapEnvelope(response.data);
};

export const getEvents = async (
  inningsId: string,
  cursor?: number,
  limit = 30,
): Promise<EventsResponse> => {
  const response = await api.get<ApiEnvelope<EventsResponse>>(
    `/innings/${inningsId}/events`,
    { params: { cursor, limit } },
  );
  return unwrapEnvelope(response.data);
};

export const changeCurrentBowler = async (
  matchId: string,
  body: ChangeBowlerRequest,
): Promise<ChangeBowlerResponse> => {
  const response = await api.patch<ApiEnvelope<ChangeBowlerResponse>>(
    `/matches/${matchId}/current-bowler`,
    body,
  );
  return unwrapEnvelope(response.data);
};

export const startSecondInnings = async (
  matchId: string,
  body: StartSecondInningsRequest,
): Promise<StartSecondInningsResponse> => {
  const response = await api.post<ApiEnvelope<StartSecondInningsResponse>>(
    `/matches/${matchId}/start-second-innings`,
    body,
  );
  return unwrapEnvelope(response.data);
};
