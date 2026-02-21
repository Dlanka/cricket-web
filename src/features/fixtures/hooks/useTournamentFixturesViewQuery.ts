import { useQuery } from "@tanstack/react-query";
import { getTournamentFixturesView } from "../services/fixtures.service";
import { fixturesQueryKeys } from "../constants/fixturesQueryKeys";

type UseTournamentFixturesViewQueryOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
};

export const useTournamentFixturesViewQuery = (
  tournamentId: string,
  options?: UseTournamentFixturesViewQueryOptions,
) =>
  useQuery({
    queryKey: fixturesQueryKeys.byTournamentFixturesView(tournamentId),
    queryFn: () => getTournamentFixturesView(tournamentId),
    enabled: options?.enabled ?? Boolean(tournamentId),
    refetchInterval: options?.refetchInterval,
  });
