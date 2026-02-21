import { useQuery } from "@tanstack/react-query";
import { getTournamentStandings } from "../services/standings.service";
import { tournamentQueryKeys } from "../constants/tournamentQueryKeys";

type UseTournamentStandingsQueryOptions = {
  enabled?: boolean;
  refetchInterval?: number | false;
};

export const useTournamentStandingsQuery = (
  tournamentId: string,
  options?: UseTournamentStandingsQueryOptions,
) =>
  useQuery({
    queryKey: tournamentQueryKeys.standings(tournamentId),
    queryFn: () => getTournamentStandings(tournamentId),
    enabled: options?.enabled ?? Boolean(tournamentId),
    refetchInterval: options?.refetchInterval,
  });
