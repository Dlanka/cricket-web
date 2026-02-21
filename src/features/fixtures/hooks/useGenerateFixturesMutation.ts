import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generate } from "../services/fixtures.service";
import { fixturesQueryKeys } from "../constants/fixturesQueryKeys";

export const useGenerateFixturesMutation = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generate(tournamentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: fixturesQueryKeys.byTournamentMatches(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: fixturesQueryKeys.byTournamentFixturesView(tournamentId),
        }),
        queryClient.invalidateQueries({
          queryKey: fixturesQueryKeys.byTournamentBracket(tournamentId),
        }),
      ]);
    },
  });
};
