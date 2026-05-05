import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pauseMatchTimer,
  resumeMatchTimer,
  startMatchTimer,
} from "../services/scoring.service";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

type TimerAction = "start" | "pause" | "resume";

export const useMatchTimerMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: TimerAction) => {
      if (action === "start") return startMatchTimer(matchId);
      if (action === "pause") return pauseMatchTimer(matchId);
      return resumeMatchTimer(matchId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: scoringQueryKeys.score(matchId),
      });
    },
  });
};

