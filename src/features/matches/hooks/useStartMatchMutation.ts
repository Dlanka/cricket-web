import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startMatch } from "../services/matches.service";
import type { StartMatchRequest } from "../types/matches.types";

export const useStartMatchMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartMatchRequest) => startMatch(matchId, payload),
    onSuccess: async (data) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: ["match", matchId] }),
        queryClient.invalidateQueries({ queryKey: ["score", matchId] }),
      ];
      if (data.inningsId) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: ["innings", data.inningsId] }),
        );
      }
      await Promise.all(invalidations);
    },
  });
};
