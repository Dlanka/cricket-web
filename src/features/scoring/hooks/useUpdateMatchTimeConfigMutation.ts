import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMatchTimeConfig } from "../services/scoring.service";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

export const useUpdateMatchTimeConfigMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { totalMatchMinutes?: number; splitByInnings?: boolean }) =>
      updateMatchTimeConfig(matchId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.score(matchId) });
    },
  });
};

