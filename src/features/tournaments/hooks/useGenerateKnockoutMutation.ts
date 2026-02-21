import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateKnockout } from "../services/standings.service";
import { tournamentQueryKeys } from "../constants/tournamentQueryKeys";
import { fixturesQueryKeys } from "../../fixtures/constants/fixturesQueryKeys";

export const useGenerateKnockoutMutation = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateKnockout(tournamentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: tournamentQueryKeys.standings(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: tournamentQueryKeys.tournamentMatches(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: tournamentQueryKeys.tournament(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: fixturesQueryKeys.byTournamentMatches(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: fixturesQueryKeys.byTournamentFixtures(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: fixturesQueryKeys.byTournamentFixturesView(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: fixturesQueryKeys.byTournamentBracket(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: tournamentQueryKeys.detail(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["fixtures", "tournament", tournamentId],
        }),
      ]);
    },
  });
};
