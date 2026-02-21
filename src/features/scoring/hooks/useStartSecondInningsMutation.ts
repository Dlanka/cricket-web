import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startSecondInnings } from "../services/scoring.service";
import type { StartSecondInningsRequest } from "../types/scoring.types";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

export const useStartSecondInningsMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartSecondInningsRequest) =>
      startSecondInnings(matchId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scoringQueryKeys.score(matchId) }),
        queryClient.invalidateQueries({
          queryKey: scoringQueryKeys.availableNextBatters(matchId),
        }),
      ]);
    },
  });
};
