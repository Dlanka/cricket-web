import { useQuery } from "@tanstack/react-query";
import { tournamentQueryKeys } from "@/features/tournaments/constants/tournamentQueryKeys";
import { getTournamentStats } from "@/features/tournaments/services/tournamentStats.service";

export const useTournamentStatsQuery = (tournamentId: string) =>
  useQuery({
    queryKey: tournamentQueryKeys.stats(tournamentId),
    queryFn: () => getTournamentStats(tournamentId),
    enabled: Boolean(tournamentId),
  });

