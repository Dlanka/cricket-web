import { useQuery } from "@tanstack/react-query";
import { listByTournament } from "../services/fixtures.service";
import { fixturesQueryKeys } from "../constants/fixturesQueryKeys";

type UseTournamentMatchesQueryOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
};

export const useTournamentMatchesQuery = (
  tournamentId: string,
  options?: UseTournamentMatchesQueryOptions,
) =>
  useQuery({
    queryKey: fixturesQueryKeys.byTournamentMatches(tournamentId),
    queryFn: () => listByTournament(tournamentId),
    enabled: options?.enabled ?? Boolean(tournamentId),
    refetchInterval: options?.refetchInterval,
  });
