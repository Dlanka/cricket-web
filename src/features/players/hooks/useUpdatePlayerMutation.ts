import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePlayer } from "../services/players.service";
import type { UpdatePlayerRequest } from "../types/players.types";

export const useUpdatePlayerMutation = (playerId: string, teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePlayerRequest) => updatePlayer(playerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", teamId] });
      queryClient.invalidateQueries({ queryKey: ["player", playerId] });
    },
  });
};
