import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fixturesQueryKeys } from "../../fixtures/constants/fixturesQueryKeys";
import { updateMatchTimeConfig } from "../services/matches.service";
import type { UpdateMatchTimeConfigRequest } from "../types/matches.types";

export const useUpdateMatchTimeConfigMutation = (
  matchId: string,
  tournamentId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMatchTimeConfigRequest) =>
      updateMatchTimeConfig(matchId, payload),
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

