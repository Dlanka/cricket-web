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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scoringQueryKeys.score(matchId) }),
        queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.batters(inningsId) }),
        queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.bowlers(inningsId) }),
        queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.overs(inningsId, 10) }),
        queryClient.invalidateQueries({ queryKey: scoringQueryKeys.innings.events(inningsId) }),
      ]);
    },
  });
};
