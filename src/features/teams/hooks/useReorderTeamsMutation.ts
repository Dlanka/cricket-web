import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderTeams } from "../services/teams.service";
import type { Team } from "../types/teams.types";

export const useReorderTeamsMutation = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedTeamIds: string[]) => reorderTeams(tournamentId, orderedTeamIds),
    onMutate: async (orderedTeamIds) => {
      await queryClient.cancelQueries({ queryKey: ["teams", tournamentId] });
      const previous = queryClient.getQueryData<Team[]>(["teams", tournamentId]);
      if (previous) {
        const byId = new Map(previous.map((team) => [team.id, team]));
        const reordered = orderedTeamIds
          .map((teamId, index) => {
            const team = byId.get(teamId);
            if (!team) return null;
            return { ...team, sortOrder: index };
          })
          .filter(Boolean) as Team[];
        queryClient.setQueryData(["teams", tournamentId], reordered);
      }
      return { previous };
    },
    onError: (_error, _orderedTeamIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["teams", tournamentId], context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teams", tournamentId] });
    },
  });
};
