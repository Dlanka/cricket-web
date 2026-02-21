import { useQuery } from "@tanstack/react-query";
import { getTournamentBracketFixtures } from "../services/fixtures.service";
import { fixturesQueryKeys } from "../constants/fixturesQueryKeys";

type UseTournamentBracketFixturesQueryOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
};

export const useTournamentBracketFixturesQuery = (
  tournamentId: string,
  options?: UseTournamentBracketFixturesQueryOptions,
) =>
  useQuery({
    queryKey: fixturesQueryKeys.byTournamentBracket(tournamentId),
    queryFn: () => getTournamentBracketFixtures(tournamentId),
    enabled: options?.enabled ?? Boolean(tournamentId),
    refetchInterval: options?.refetchInterval,
  });
