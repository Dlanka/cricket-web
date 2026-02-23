import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeamAccessPlayer } from "@/features/teams/services/teams.service";
import type { UpdatePlayerRequest } from "@/features/players/types/players.types";

export const useUpdateTeamAccessPlayerMutation = (token: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      playerId,
      payload,
    }: {
      playerId: string;
      payload: UpdatePlayerRequest;
    }) => updateTeamAccessPlayer(token, playerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-access", token, "context"] });
    },
  });
};
