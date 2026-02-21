import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fixturesQueryKeys } from "../../fixtures/constants/fixturesQueryKeys";
import { updateMatchConfig } from "../services/matches.service";
import type { UpdateMatchConfigRequest } from "../types/matches.types";

export const useUpdateMatchConfigMutation = (
  matchId: string,
  tournamentId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMatchConfigRequest) =>
      updateMatchConfig(matchId, payload),
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
