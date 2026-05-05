import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLiveMatchConfig } from "../services/scoring.service";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

export const useUpdateLiveMatchConfigMutation = (
  matchId: string,
  inningsId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { oversPerInnings?: number; ballsPerOver?: number }) =>
      updateLiveMatchConfig(matchId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.score(matchId) });
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.overs(inningsId, 10) });
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.events(inningsId) });
    },
  });
};

