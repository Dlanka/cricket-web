import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitScoreEvent } from "../services/scoringPanel.service";
import type { ScoreEventRequest } from "../types/scoringPanel.types";
import type { MatchScoreResponse } from "../../scoring/types/scoring.types";
import { scoringQueryKeys } from "../../scoring/constants/scoringQueryKeys";
import { fixturesQueryKeys } from "../../fixtures/constants/fixturesQueryKeys";
import { tournamentQueryKeys } from "../../tournaments/constants/tournamentQueryKeys";

export const mergeScoreSnapshot = (
  previous: MatchScoreResponse | undefined,
  data: {
    inningsId: string;
    inningsCompleted: boolean;
    isMatchCompleted?: boolean;
    score?: MatchScoreResponse["score"];
    current?: MatchScoreResponse["current"];
    event: { id: string; seq: number; type: string };
  },
): MatchScoreResponse | undefined => {
  if (!previous) {
    return previous;
  }

  return {
    ...previous,
    inningsId: data.inningsId ?? previous.inningsId,
    inningsCompleted: data.inningsCompleted ?? previous.inningsCompleted,
    isMatchCompleted: data.isMatchCompleted ?? previous.isMatchCompleted,
    score: data.score ? data.score : previous.score,
    current: data.current ? data.current : previous.current,
    lastEvent: data.event
      ? {
          id: data.event.id,
          seq: data.event.seq,
          type: data.event.type,
        }
      : previous.lastEvent,
  };
};

export const useSubmitScoreEventMutation = (
  matchId: string,
  inningsId?: string,
  tournamentId?: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScoreEventRequest) => submitScoreEvent(matchId, payload),
    onSuccess: (data) => {
      if (data.score || data.current) {
        queryClient.setQueryData<MatchScoreResponse | undefined>(
          scoringQueryKeys.score(matchId),
          (previous) => mergeScoreSnapshot(previous, data),
        );
      }

      const cachedScore = queryClient.getQueryData<MatchScoreResponse>(
        scoringQueryKeys.score(matchId),
      );
      const resolvedInningsId = data.inningsId ?? inningsId ?? cachedScore?.inningsId;

      if (!resolvedInningsId) {
        return;
      }

      // Keep delivery submit snappy: don't block mutation resolution with large refetch chains.
      // MatchScoringPage already refreshes innings sections when score seq changes.
      void queryClient.invalidateQueries({
        queryKey: scoringQueryKeys.availableNextBatters(matchId),
      });

      // Refresh broader tournament/match contexts only when state likely changes beyond current ball.
      const shouldRefreshGlobalViews =
        Boolean(data.inningsCompleted) || Boolean(data.isMatchCompleted);
      if (shouldRefreshGlobalViews) {
        void queryClient.invalidateQueries({ queryKey: ["match", matchId] });
        if (tournamentId) {
          void queryClient.invalidateQueries({
            queryKey: fixturesQueryKeys.byTournamentFixtures(tournamentId),
          });
          void queryClient.invalidateQueries({
            queryKey: fixturesQueryKeys.byTournamentFixturesView(tournamentId),
          });
          void queryClient.invalidateQueries({
            queryKey: fixturesQueryKeys.byTournamentBracket(tournamentId),
          });
          void queryClient.invalidateQueries({
            queryKey: tournamentQueryKeys.standings(tournamentId),
          });
          void queryClient.invalidateQueries({
            queryKey: tournamentQueryKeys.detail(tournamentId),
          });
          void queryClient.invalidateQueries({
            queryKey: ["tournamentMatches", tournamentId],
          });
          void queryClient.invalidateQueries({
            queryKey: ["fixturesView", tournamentId],
          });
          void queryClient.invalidateQueries({
            queryKey: ["fixturesBracket", tournamentId],
          });
          void queryClient.invalidateQueries({
            queryKey: tournamentQueryKeys.playerOfSeries(tournamentId),
          });
        }
      }
    },
  });
};
