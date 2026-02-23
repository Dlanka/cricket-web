import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeamAccessPlayer } from "@/features/teams/services/teams.service";
import type { CreatePlayerRequest } from "@/features/players/types/players.types";

export const useCreateTeamAccessPlayerMutation = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlayerRequest) => createTeamAccessPlayer(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-access", token, "context"] });
    },
  });
};
