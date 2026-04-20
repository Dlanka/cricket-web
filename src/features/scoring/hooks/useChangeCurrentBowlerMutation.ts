import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeCurrentBowler } from "../services/scoring.service";
import type { MatchScoreResponse } from "../types/scoring.types";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

export const useChangeCurrentBowlerMutation = (
  matchId: string,
  inningsId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async (bowlerId: string) => {
      await queryClient.cancelQueries({ queryKey: scoringQueryKeys.score(matchId) });
      const previousScore = queryClient.getQueryData<MatchScoreResponse>(
        scoringQueryKeys.score(matchId),
      );

      if (previousScore) {
        queryClient.setQueryData<MatchScoreResponse>(scoringQueryKeys.score(matchId), {
          ...previousScore,
          current: {
            ...previousScore.current,
            bowlerId,
          },
        });
      }

      return { previousScore };
    },
    mutationFn: (bowlerId: string) => changeCurrentBowler(matchId, { bowlerId }),
    onError: (_error, _bowlerId, context) => {
      if (context?.previousScore) {
        queryClient.setQueryData(scoringQueryKeys.score(matchId), context.previousScore);
      }
    },
    onSuccess: () => {
      // Fire-and-forget refresh so modal/button state is not blocked by network round trips.
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.score(matchId) });
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.batters(inningsId) });
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.bowlers(inningsId) });
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.overs(inningsId, 10) });
      void queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.events(inningsId) });
    },
  });
};
