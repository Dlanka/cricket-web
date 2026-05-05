import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeCurrentBatters } from "../services/scoring.service";
import type {
  ChangeCurrentBattersRequest,
  MatchScoreResponse,
} from "../types/scoring.types";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

export const useChangeCurrentBattersMutation = (
  matchId: string,
  inningsId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangeCurrentBattersRequest) =>
      changeCurrentBatters(matchId, payload),
    onMutate: async ({ strikerId, nonStrikerId }) => {
      await queryClient.cancelQueries({ queryKey: scoringQueryKeys.score(matchId) });
      const previousScore = queryClient.getQueryData<MatchScoreResponse>(
        scoringQueryKeys.score(matchId),
      );

      if (previousScore) {
        queryClient.setQueryData<MatchScoreResponse>(scoringQueryKeys.score(matchId), {
          ...previousScore,
          current: {
            ...previousScore.current,
            strikerId,
            nonStrikerId,
          },
        });
      }

      return { previousScore };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousScore) {
        queryClient.setQueryData(scoringQueryKeys.score(matchId), context.previousScore);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.score(matchId) });
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.batters(inningsId) });
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.overs(inningsId, 10) });
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.events(inningsId) });
    },
  });
};
