import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fixturesQueryKeys } from "@/features/fixtures/constants/fixturesQueryKeys";
import { startSuperOver } from "@/features/matches/services/matches.service";
import type { StartSuperOverRequest } from "@/features/matches/types/matches.types";

export const useStartSuperOverMutation = (matchId: string, tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartSuperOverRequest) => startSuperOver(matchId, payload),
    onSuccess: async () => {
      const tasks = [
        queryClient.invalidateQueries({ queryKey: ["match", matchId] }),
        queryClient.invalidateQueries({ queryKey: ["score", matchId] }),
      ];

      if (tournamentId) {
        tasks.push(
          queryClient.invalidateQueries({ queryKey: ["tournamentMatches", tournamentId] }),
          queryClient.invalidateQueries({ queryKey: ["fixturesView", tournamentId] }),
          queryClient.invalidateQueries({ queryKey: ["fixturesBracket", tournamentId] }),
          queryClient.invalidateQueries({ queryKey: fixturesQueryKeys.byTournamentMatches(tournamentId) }),
          queryClient.invalidateQueries({ queryKey: fixturesQueryKeys.byTournamentFixturesView(tournamentId) }),
          queryClient.invalidateQueries({ queryKey: fixturesQueryKeys.byTournamentBracket(tournamentId) }),
        );
      }

      await Promise.all(tasks);
    },
  });
};
