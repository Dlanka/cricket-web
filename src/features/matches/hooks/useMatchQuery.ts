import { useQuery } from "@tanstack/react-query";
import { getMatch } from "../services/matches.service";

export const useMatchQuery = (matchId: string, enabled = true) =>
  useQuery({
    queryKey: ["match", matchId],
    queryFn: () => getMatch(matchId),
    enabled: Boolean(matchId) && enabled,
  });
