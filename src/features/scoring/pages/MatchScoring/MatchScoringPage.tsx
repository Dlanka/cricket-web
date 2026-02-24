import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { useMatchScoreQuery } from "../../hooks/useMatchScoreQuery";
import { MatchScoringPageSkeleton } from "./MatchScoringPage.skeleton";
import { ScoreboardHeader } from "./ScoreboardHeader";
import { BattersTable } from "./BattersTable";
import { BowlersTable } from "./BowlersTable";
import { OverHistoryPanel } from "./OverHistoryPanel";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { ScoringPanel } from "@/features/scoringPanel/components/ScoringPanel";
import { Card } from "@/shared/components/card/Card";
import { usePlayersByTeamQuery } from "@/features/players/hooks/usePlayersByTeamQuery";
import { scoringQueryKeys } from "../../constants/scoringQueryKeys";

type MatchScoringPageProps = {
  matchId: string;
  tournamentId?: string;
};

export const MatchScoringPage = ({
  matchId,
  tournamentId,
}: MatchScoringPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const previousSeq = useRef<number | null>(null);
  const [resolvedOverBoundaryBalls, setResolvedOverBoundaryBalls] = useState<
    number | null
  >(null);
  const scoreQuery = useMatchScoreQuery(matchId, true, 2000);

  useEffect(() => {
    const inningsId = scoreQuery.data?.inningsId;
    const currentSeq = scoreQuery.data?.lastEvent?.seq ?? null;
    if (!inningsId || currentSeq == null) {
      return;
    }
    if (previousSeq.current == null) {
      previousSeq.current = currentSeq;
      return;
    }
    if (currentSeq === previousSeq.current) {
      return;
    }
    previousSeq.current = currentSeq;
    void Promise.all([
      queryClient.invalidateQueries({
        queryKey: scoringQueryKeys.innings.batters(inningsId),
      }),
      queryClient.invalidateQueries({
        queryKey: scoringQueryKeys.innings.bowlers(inningsId),
      }),
      queryClient.invalidateQueries({
        queryKey: scoringQueryKeys.innings.overs(inningsId, 10),
      }),
      queryClient.invalidateQueries({
        queryKey: scoringQueryKeys.innings.events(inningsId),
      }),
    ]);
  }, [
    queryClient,
    scoreQuery.data?.inningsId,
    scoreQuery.data?.lastEvent?.seq,
  ]);

  const battingTeamId = scoreQuery.data?.battingTeam.id ?? "";
  const bowlingTeamId = scoreQuery.data?.bowlingTeam.id ?? "";
  const battingPlayersQuery = usePlayersByTeamQuery(battingTeamId);
  const bowlingPlayersQuery = usePlayersByTeamQuery(bowlingTeamId);
  const playerNameById = useMemo(() => {
    const entries = [...(battingPlayersQuery.data ?? []), ...(bowlingPlayersQuery.data ?? [])]
      .filter((player) => player.id)
      .map((player) => [player.id, player.fullName] as const);
    return Object.fromEntries(entries);
  }, [battingPlayersQuery.data, bowlingPlayersQuery.data]);

  const transientScoreError = normalizeApiError(scoreQuery.failureReason);

  if (scoreQuery.isLoading) {
    if (transientScoreError.code === "match.starting_in_progress") {
      return (
        <EmptyState
          title="Preparing live score..."
          description="Finalizing match start. Retrying automatically."
        />
      );
    }
    return <MatchScoringPageSkeleton />;
  }

  if (scoreQuery.isError) {
    const normalized = normalizeApiError(scoreQuery.error);

    if (normalized.code === "match.not_found" || normalized.status === 404) {
      return (
        <EmptyState
          title="Match not found"
          description="This match is unavailable or has been removed."
        />
      );
    }

    if (normalized.code === "match.invalid_state") {
      return (
        <EmptyState
          title="Match not live"
          description="Scoring becomes available once the match is started."
        />
      );
    }

    if (normalized.code === "match.starting_in_progress") {
      return (
        <EmptyState
          title="Preparing live score..."
          description="Finalizing match start. Retrying automatically."
        />
      );
    }

    if (normalized.status === 403) {
      return (
        <EmptyState
          title="Access denied"
          description="You do not have permission to view this scoring context."
        />
      );
    }

    if (normalized.status === 401) {
      window.location.assign("/login");
      return null;
    }

    return (
      <div className="rounded-2xl border border-error-80 bg-error-95 p-6 text-sm text-error-40">
        {scoreQuery.error instanceof Error
          ? scoreQuery.error.message
          : "Unable to load score context."}
      </div>
    );
  }

  if (!scoreQuery.data) {
    return (
      <EmptyState
        title="Match not live"
        description="Scoring becomes available once the match is started."
      />
    );
  }

  const score = scoreQuery.data;
  const inningsId = score.inningsId;
  const rawScore = score.score as unknown as Record<string, unknown>;
  const normalizeKey = (value: string) =>
    value.toLowerCase().replace(/[_\-\s]/g, "");
  const findNumberByKeys = (
    source: unknown,
    keys: string[],
    depth = 0,
  ): number | undefined => {
    if (depth > 4 || !source || typeof source !== "object") {
      return undefined;
    }
    const record = source as Record<string, unknown>;
    const normalizedAliases = keys.map(normalizeKey);

    for (const [rawKey, rawValue] of Object.entries(record)) {
      const normalizedKey = normalizeKey(rawKey);
      if (!normalizedAliases.some((alias) => normalizedKey.includes(alias))) {
        continue;
      }
      if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
        return rawValue;
      }
      if (typeof rawValue === "string") {
        const parsed = Number(rawValue);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }
    for (const value of Object.values(record)) {
      const nested = findNumberByKeys(value, keys, depth + 1);
      if (nested != null) {
        return nested;
      }
    }
    return undefined;
  };
  const pickNumber = (...keys: string[]) => findNumberByKeys(rawScore, keys);
  const totalBallsLimit =
    score.settings.oversPerInnings * score.settings.ballsPerOver;
  const isOverBoundary =
    score.score.balls > 0 &&
    score.score.balls < totalBallsLimit &&
    score.score.balls % score.settings.ballsPerOver === 0;
  const showChangeBowlerButton =
    !score.inningsCompleted &&
    isOverBoundary &&
    resolvedOverBoundaryBalls !== score.score.balls;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-6xl flex-col px-6">
      <div className="mt-4 flex-1 overflow-visible">
        <div className="sticky top-3 z-30">
          <ScoreboardHeader
            score={score}
            onBack={
              tournamentId
                ? () =>
                    navigate({
                      to: "/tournaments/$tournamentId/fixtures",
                      params: { tournamentId },
                    })
                : undefined
            }
          />
        </div>
        <div className="mt-4 grid grid-cols-12 gap-4">
          <div className="col-span-12 space-y-4 xl:col-span-6">
            <BattersTable
              inningsId={inningsId}
              strikerId={score.current.strikerId}
              nonStrikerId={score.current.nonStrikerId}
              playerNameById={playerNameById}
              totalRuns={score.score.runs}
              extrasBreakdown={{
                extras: pickNumber("extras", "extra", "extraRuns"),
                wides: pickNumber("wides", "wide", "wd", "wideRuns"),
                noBalls: pickNumber(
                  "noBalls",
                  "noballs",
                  "no_ball",
                  "noball",
                  "nb",
                  "noBallRuns",
                ),
                byes: pickNumber("byes", "bye", "byeRuns"),
                legByes: pickNumber("legByes", "legbye", "leg_bye", "lb"),
              }}
            />
            <BowlersTable
              inningsId={inningsId}
              currentBowlerId={score.current.bowlerId}
              playerNameById={playerNameById}
            />
          </div>
          <div className="col-span-12 xl:col-span-6">
            <div className="sticky top-35 z-20 space-y-4">
              <Card className="space-y-4 ">
                <OverHistoryPanel
                  inningsId={inningsId}
                  currentBalls={score.score.balls}
                  ballsPerOver={score.settings.ballsPerOver}
                  resolvedOverBoundaryBalls={resolvedOverBoundaryBalls}
                  embedded
                />
                <div className="border-t border-neutral-90 pt-4">
                  <ScoringPanel
                    matchId={matchId}
                    tournamentId={tournamentId}
                    inningsId={inningsId}
                    battingTeamId={score.battingTeam.id}
                    bowlingTeamId={score.bowlingTeam.id}
                    currentStrikerId={score.current.strikerId}
                    currentNonStrikerId={score.current.nonStrikerId}
                    currentBowlerId={score.current.bowlerId}
                    inningsNumber={score.inningsNumber}
                    totalBallsPerOver={score.settings.ballsPerOver}
                    totalOvers={score.settings.oversPerInnings}
                    currentBalls={score.score.balls}
                    inningsCompleted={score.inningsCompleted}
                    isMatchCompleted={score.isMatchCompleted}
                    phase={score.phase}
                    embedded
                    showChangeBowlerButton={showChangeBowlerButton}
                    onBowlerChangedAtBoundary={setResolvedOverBoundaryBalls}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
