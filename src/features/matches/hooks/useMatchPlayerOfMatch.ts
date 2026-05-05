import { useQuery } from "@tanstack/react-query";
import { getMatchPlayerOfMatch } from "../services/matches.service";

export const useMatchPlayerOfMatch = (
  matchId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["match", matchId, "awards", "player-of-match"],
    queryFn: () => getMatchPlayerOfMatch(matchId),
    enabled: Boolean(matchId) && enabled,
    staleTime: 15_000,
  });

