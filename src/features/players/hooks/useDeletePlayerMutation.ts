import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePlayer } from "../services/players.service";

export const useDeletePlayerMutation = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId: string) => deletePlayer(playerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["players", teamId],
      });
    },
  });
};
