import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recomputeTournamentStandings } from "../services/standings.service";
import { tournamentQueryKeys } from "../constants/tournamentQueryKeys";

export const useRecomputeStandingsMutation = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recomputeTournamentStandings(tournamentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tournamentQueryKeys.standings(tournamentId),
      });
    },
  });
};
