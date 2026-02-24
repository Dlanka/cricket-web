import { useQuery } from "@tanstack/react-query";
import { tournamentQueryKeys } from "@/features/tournaments/constants/tournamentQueryKeys";
import { getTournamentPlayerOfSeries } from "@/features/tournaments/services/tournamentAwards.service";

export const useTournamentPlayerOfSeriesQuery = (
  tournamentId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: tournamentQueryKeys.playerOfSeries(tournamentId),
    queryFn: () => getTournamentPlayerOfSeries(tournamentId),
    enabled: Boolean(tournamentId) && enabled,
    refetchOnMount: "always",
  });
