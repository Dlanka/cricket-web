import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlayer } from "../services/players.service";
import type { CreatePlayerRequest } from "../types/players.types";

export const useCreatePlayerMutation = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlayerRequest) => createPlayer(teamId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["players", teamId],
      });
    },
  });
};
