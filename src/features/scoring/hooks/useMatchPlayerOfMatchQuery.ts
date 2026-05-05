import { useQuery } from "@tanstack/react-query";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";
import { getMatchPlayerOfMatch } from "../services/scoring.service";

export const useMatchPlayerOfMatchQuery = (
  matchId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: scoringQueryKeys.playerOfMatch(matchId),
    queryFn: () => getMatchPlayerOfMatch(matchId),
    enabled: enabled && Boolean(matchId),
    staleTime: 10_000,
  });

