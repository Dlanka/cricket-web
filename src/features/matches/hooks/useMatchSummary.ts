import { useQuery } from "@tanstack/react-query";
import { getMatchSummary } from "../services/matches.service";

export const useMatchSummary = (matchId: string) =>
  useQuery({
    queryKey: ["match", matchId, "summary"],
    queryFn: () => getMatchSummary(matchId),
    enabled: Boolean(matchId),
    refetchInterval: (query) =>
      query.state.data?.match.status === "LIVE" ? 12000 : false,
  });

