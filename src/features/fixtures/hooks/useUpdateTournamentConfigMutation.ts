import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTournamentConfig } from "../services/fixtures.service";
import type { TournamentConfigInput } from "../types/fixtures.types";
import { fixturesQueryKeys } from "../constants/fixturesQueryKeys";
import { tournamentQueryKeys } from "../../tournaments/constants/tournamentQueryKeys";

export const useUpdateTournamentConfigMutation = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TournamentConfigInput) =>
      updateTournamentConfig(tournamentId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: tournamentQueryKeys.tournament(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: tournamentQueryKeys.tournamentMatches(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: tournamentQueryKeys.detail(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: tournamentQueryKeys.list,
        }),
        queryClient.invalidateQueries({
          queryKey: fixturesQueryKeys.byTournamentMatches(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: fixturesQueryKeys.byTournamentFixturesView(tournamentId),
        }),
      ]);
    },
  });
};
