import { useQuery } from "@tanstack/react-query";
import { getMatch } from "../services/fixtures.service";
import { fixturesQueryKeys } from "../constants/fixturesQueryKeys";

export const useMatchQuery = (matchId: string, enabled = true) =>
  useQuery({
    queryKey: fixturesQueryKeys.match(matchId),
    queryFn: () => getMatch(matchId),
    enabled: Boolean(matchId) && enabled,
  });
