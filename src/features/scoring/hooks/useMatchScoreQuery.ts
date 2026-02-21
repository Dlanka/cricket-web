import { useQuery } from "@tanstack/react-query";
import { getMatchScore } from "../services/scoring.service";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import type { MatchScoreResponse } from "../types/scoring.types";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

const RETRY_DELAYS = [500, 1000, 1500, 2000, 2500] as const;

const isTransientStartCode = (code?: string) =>
  code === "match.starting_in_progress" || code === "match.invalid_state";

export const useMatchScoreQuery = (
  matchId: string,
  enabled = true,
  refetchInterval: number | false = 2000,
) =>
  useQuery({
    queryKey: scoringQueryKeys.score(matchId),
    queryFn: () => getMatchScore(matchId),
    enabled: Boolean(matchId) && enabled,
    refetchInterval: enabled
      ? (query) => {
          const data = query.state.data as MatchScoreResponse | undefined;
          if (data?.isMatchCompleted) return false;
          return refetchInterval;
        }
      : false,
    retry: (failureCount, error) => {
      const normalized = normalizeApiError(error);
      if (isTransientStartCode(normalized.code)) {
        return failureCount < RETRY_DELAYS.length;
      }
      if (normalized.status && normalized.status >= 400 && normalized.status < 500) {
        return false;
      }
      return false;
    },
    retryDelay: (attemptIndex, error) => {
      const normalized = normalizeApiError(error);
      if (isTransientStartCode(normalized.code)) {
        if (normalized.retryAfterMs && normalized.retryAfterMs > 0) {
          return normalized.retryAfterMs;
        }
        return RETRY_DELAYS[Math.min(attemptIndex, RETRY_DELAYS.length - 1)];
      }
      return 0;
    },
  });
