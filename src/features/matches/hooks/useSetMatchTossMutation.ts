import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fixturesQueryKeys } from "@/features/fixtures/constants/fixturesQueryKeys";
import { setMatchToss } from "@/features/matches/services/matches.service";
import type { SetMatchTossRequest } from "@/features/matches/types/matches.types";

export const useSetMatchTossMutation = (matchId: string, tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetMatchTossRequest) => setMatchToss(matchId, payload),
    onSuccess: async () => {
      const tasks = [
        queryClient.invalidateQueries({ queryKey: fixturesQueryKeys.match(matchId) }),
      ];

      if (tournamentId) {
        tasks.push(
          queryClient.invalidateQueries({
            queryKey: ["tournament", tournamentId, "matches"],
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
            queryKey: ["fixtures", "tournament", tournamentId],
          }),
        );
      }

      await Promise.all(tasks);
    },
  });
};
