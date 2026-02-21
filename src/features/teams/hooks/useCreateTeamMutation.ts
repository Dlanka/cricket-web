import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeam } from "../services/teams.service";
import type { CreateTeamRequest, Team } from "../types/teams.types";

export const useCreateTeamMutation = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeamRequest) =>
      createTeam(tournamentId, payload),
    onSuccess: async (createdTeam) => {
      queryClient.setQueryData(
        ["teams", tournamentId],
        (current: Team[] | undefined) =>
          current ? [createdTeam, ...current] : [createdTeam],
      );
      await queryClient.invalidateQueries({
        queryKey: ["teams", tournamentId],
      });
    },
  });
};
