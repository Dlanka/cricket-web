import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeam } from "../services/teams.service";
import type { UpdateTeamRequest } from "../types/teams.types";

export const useUpdateTeamMutation = (teamId: string, tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTeamRequest) => updateTeam(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
    },
  });
};
