import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fixturesQueryKeys } from "@/features/fixtures/constants/fixturesQueryKeys";
import { tournamentQueryKeys } from "@/features/tournaments/constants/tournamentQueryKeys";
import { resolveMatchTie } from "@/features/matches/services/matches.service";

export const useResolveMatchTieMutation = (matchId: string, tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ winnerTeamId }: { winnerTeamId: string }) =>
      resolveMatchTie(matchId, winnerTeamId),
    onSuccess: async () => {
      const tasks = [
        queryClient.invalidateQueries({ queryKey: fixturesQueryKeys.match(matchId) }),
      ];

      if (tournamentId) {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: fixturesQueryKeys.byTournamentMatches(tournamentId),
          }),
          queryClient.invalidateQueries({
            queryKey: fixturesQueryKeys.byTournamentFixturesView(tournamentId),
          }),
          queryClient.invalidateQueries({
            queryKey: fixturesQueryKeys.byTournamentBracket(tournamentId),
          }),
          queryClient.invalidateQueries({
            queryKey: tournamentQueryKeys.standings(tournamentId),
          }),
        );
      }

      await Promise.all(tasks);
    },
  });
};
