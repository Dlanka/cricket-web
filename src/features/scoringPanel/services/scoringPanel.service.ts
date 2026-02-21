import { api } from "@/shared/services/axios";
import type { ApiError } from "@/shared/types/http.types";
import type {
  AvailableNextBattersResponse,
  ScoreEventRequest,
  ScoreEventResponse,
} from "@/features/scoringPanel/types/scoringPanel.types";

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown };
};

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
        status: 400,
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

export const submitScoreEvent = async (
  matchId: string,
  payload: ScoreEventRequest,
): Promise<ScoreEventResponse> => {
  const response = await api.post<ApiEnvelope<ScoreEventResponse> | ScoreEventResponse>(
    `/matches/${matchId}/score-events`,
    payload,
  );
  return unwrapEnvelope(response.data);
};

export const getAvailableNextBatters = async (
  matchId: string,
): Promise<AvailableNextBattersResponse> => {
  const response = await api.get<
    ApiEnvelope<AvailableNextBattersResponse> | AvailableNextBattersResponse
  >(`/matches/${matchId}/available-next-batters`);
  return unwrapEnvelope(response.data);
};
