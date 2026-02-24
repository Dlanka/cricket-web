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
    score: MatchScoreResponse["score"];
    current: MatchScoreResponse["current"];
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
    score: data.score ?? previous.score,
    current: data.current ?? previous.current,
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
    onSuccess: async (data) => {
      queryClient.setQueryData<MatchScoreResponse | undefined>(
        scoringQueryKeys.score(matchId),
        (previous) => mergeScoreSnapshot(previous, data),
      );

      await queryClient.invalidateQueries({ queryKey: scoringQueryKeys.score(matchId) });
      await queryClient.invalidateQueries({ queryKey: ["match", matchId] });

      const cachedScore = queryClient.getQueryData<MatchScoreResponse>(
        scoringQueryKeys.score(matchId),
      );
      const resolvedInningsId = data.inningsId ?? inningsId ?? cachedScore?.inningsId;

      if (!resolvedInningsId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: scoringQueryKeys.innings.batters(resolvedInningsId),
        }),
        queryClient.invalidateQueries({
          queryKey: scoringQueryKeys.innings.bowlers(resolvedInningsId),
        }),
        queryClient.invalidateQueries({
          queryKey: scoringQueryKeys.innings.overs(resolvedInningsId, 10),
        }),
        queryClient.invalidateQueries({
          queryKey: scoringQueryKeys.innings.events(resolvedInningsId),
        }),
        queryClient.invalidateQueries({
          queryKey: scoringQueryKeys.availableNextBatters(matchId),
        }),
        ...(tournamentId
          ? [
              queryClient.invalidateQueries({
                queryKey: fixturesQueryKeys.byTournamentFixtures(tournamentId),
              }),
              queryClient.invalidateQueries({
                queryKey: fixturesQueryKeys.byTournamentFixturesView(tournamentId),
              }),
              queryClient.invalidateQueries({
                queryKey: fixturesQueryKeys.byTournamentBracket(tournamentId),
              }),
              queryClient.invalidateQueries({
                queryKey: tournamentQueryKeys.standings(tournamentId),
              }),
              queryClient.invalidateQueries({
                queryKey: tournamentQueryKeys.detail(tournamentId),
              }),
              queryClient.invalidateQueries({
                queryKey: ["tournamentMatches", tournamentId],
              }),
              queryClient.invalidateQueries({
                queryKey: ["fixturesView", tournamentId],
              }),
              queryClient.invalidateQueries({
                queryKey: ["fixturesBracket", tournamentId],
              }),
              queryClient.invalidateQueries({
                queryKey: tournamentQueryKeys.playerOfSeries(tournamentId),
              }),
            ]
          : []),
      ]);
    },
  });
};
