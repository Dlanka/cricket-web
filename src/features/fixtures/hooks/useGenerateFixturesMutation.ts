import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generate } from "../services/fixtures.service";
import { fixturesQueryKeys } from "../constants/fixturesQueryKeys";
import type { GenerateFixturesInput } from "../types/fixtures.types";

export const useGenerateFixturesMutation = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: GenerateFixturesInput) => generate(tournamentId, payload),
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
