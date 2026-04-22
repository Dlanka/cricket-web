import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTeam } from "../services/teams.service";

export const useDeleteTeamMutation = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: ["teams", tournamentId] });
      queryClient.removeQueries({ queryKey: ["team", teamId] });
    },
  });
};
