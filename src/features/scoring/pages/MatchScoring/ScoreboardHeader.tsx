import { useEffect, useState } from "react";
import { Card } from "@/shared/components/card/Card";
import { StatusPill } from "@/shared/components/badge/StatusPill";
import { Button } from "@/components/ui/button/Button";
import { Pause, Play } from "lucide-react";
import { calculateCRR } from "@/shared/utils/calculateCRR";
import { calculateRRR } from "@/shared/utils/calculateRRR";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { useMatchTimerMutation } from "../../hooks/useMatchTimerMutation";
import { useMatchPlayerOfMatchQuery } from "../../hooks/useMatchPlayerOfMatchQuery";
import type { MatchScoreResponse } from "../../types/scoring.types";

type Props = {
  matchId: string;
  score: MatchScoreResponse;
};

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const ScoreboardHeader = ({ matchId, score }: Props) => {
  const { can } = useAuthorization();
  const canManageTimer = can("match.start");
  const timerMutation = useMatchTimerMutation(matchId);
  const playerOfMatchQuery = useMatchPlayerOfMatchQuery(
    matchId,
    Boolean(score.isMatchCompleted),
  );
  const crr = calculateCRR(
    score.score.runs,
    score.score.balls,
    score.settings.ballsPerOver,
  );

  const isSecondInnings = score.isChase ?? score.inningsNumber === 2;
  const activeChase = score.superOverChase ?? score.chase ?? null;
  const targetRuns =
    score.superOverChase?.targetRuns ??
    score.chase?.targetRuns ??
    score.chase?.target;
  const runsRemaining =
    score.superOverChase?.runsRemaining ??
    score.chase?.runsRemaining ??
    score.chase?.runsNeeded;
  const ballsRemaining = activeChase?.ballsRemaining;
  const computedRrr =
    isSecondInnings && runsRemaining != null && ballsRemaining != null
      ? calculateRRR(runsRemaining, ballsRemaining, score.settings.ballsPerOver)
      : null;
  const rrrValue = isSecondInnings
    ? (activeChase?.requiredRunRate ??
      (computedRrr != null ? computedRrr.toFixed(2) : "-"))
    : null;

  const winnerName =
    score.result?.winnerTeamId === score.battingTeam.id
      ? score.battingTeam.name
      : score.result?.winnerTeamId === score.bowlingTeam.id
        ? score.bowlingTeam.name
        : "Winner";

  const resultText = (() => {
    if (!score.isMatchCompleted || !score.result?.type) return null;
    if (score.result.type === "TIE") return "Match tied";
    if (score.result.type === "WIN") {
      if (score.result.winByWickets != null) {
        return `${winnerName} won by ${score.result.winByWickets} wickets`;
      }
      if (score.result.winByRuns != null) {
        return `${winnerName} won by ${score.result.winByRuns} runs`;
      }
      return `${winnerName} won`;
    }
    if (score.result.type === "NO_RESULT") return "No result";
    return null;
  })();

  const inningsBadge =
    score.phase === "SUPER_OVER"
      ? "Super over"
      : isSecondInnings
        ? "2nd innings"
        : "1st innings";
  const timer = score.timer;
  const [displayElapsedMs, setDisplayElapsedMs] = useState<number>(
    timer?.elapsedMs ?? 0,
  );

  useEffect(() => {
    setDisplayElapsedMs(timer?.elapsedMs ?? 0);
  }, [timer?.elapsedMs]);

  useEffect(() => {
    if (!timer || timer.status !== "RUNNING") return;
    const intervalId = window.setInterval(() => {
      setDisplayElapsedMs((previous) => previous + 1000);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [timer?.status]);

  const timerLabel = timer ? formatDuration(displayElapsedMs) : "00:00";
  const targetLabel = timer?.targetMs ? formatDuration(timer.targetMs) : null;
  const timerActionLabel =
    timer?.status === "RUNNING"
      ? "Pause"
      : timer?.status === "PAUSED"
        ? "Resume"
        : "Start";
  const timerActionType =
    timer?.status === "RUNNING"
      ? "pause"
      : timer?.status === "PAUSED"
        ? "resume"
        : "start";
  const penaltyRuns = score.score.penalties ?? 0;
  const hasPenalty = penaltyRuns !== 0;
  const penaltyLabel =
    penaltyRuns < 0
      ? `Penalty deduction: ${Math.abs(penaltyRuns)} runs (included in total)`
      : `Penalty award: ${penaltyRuns} runs (included in total)`;

  return (
    <Card className="space-y-5 border-outline-variant bg-surface-container p-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <p className="font-display text-2xs font-bold tracking-widest uppercase text-on-surface-muted">
              Live score
            </p>
          </div>
          <div className="flex items-center gap-2">
            {targetLabel ? (
              <p className="font-display text-xs font-semibold uppercase tracking-wider text-on-surface-muted">
                Target {targetLabel}
              </p>
            ) : null}
            <p className="w-16 text-right tabular-nums font-display text-base font-bold uppercase tracking-wide text-on-surface">
              {timerLabel}
            </p>
            {canManageTimer ? (
              <div className="pr-2">
                <Button
                  type="button"
                  appearance="tonal"
                  color="primary"
                  size="xs"
                  className="w-8 h-8 p-0"
                  disabled={timerMutation.isPending || score.isMatchCompleted}
                  onClick={() => {
                    void timerMutation.mutateAsync(timerActionType);
                  }}
                  title={timerActionLabel}
                  aria-label={timerActionLabel}
                >
                  {timer?.status === "RUNNING" ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            ) : null}
            <StatusPill variant="info" size="sm">
              {inningsBadge}
            </StatusPill>
          </div>
        </div>

        <p className="font-display text-base font-bold uppercase tracking-wide text-on-surface">
          {score.battingTeam.name}
          <span className="px-3 font-body text-xs font-medium uppercase tracking-wider text-on-surface-muted">
            vs
          </span>
          <span className="text-on-surface-muted">
            {score.bowlingTeam.name}
          </span>
        </p>

        <p className="font-display leading-none font-bold text-on-surface">
          <span className="text-5xl">{score.score.runs}</span>
          <span className="px-2 text-4xl text-on-surface-variant">/</span>
          <span className="text-4xl text-on-primary-container">
            {score.score.wickets}
          </span>
          <span className="ml-3 text-2xl font-semibold text-on-surface-muted">
            ({score.score.overs})
          </span>
        </p>
        {hasPenalty ? (
          <p className="font-display text-xs font-semibold tracking-wider text-on-warning-container">
            {penaltyLabel}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 font-display text-sm font-semibold uppercase tracking-wider">
          <p className="text-on-surface-muted">
            CRR{" "}
            <span className="text-on-primary-container">{crr.toFixed(2)}</span>
          </p>
          {isSecondInnings ? (
            <>
              <span className="text-outline-strong">|</span>
              <p className="text-on-surface-muted">
                RRR{" "}
                <span className="text-on-warning-container">{rrrValue}</span>
              </p>
            </>
          ) : null}
        </div>

        {isSecondInnings &&
        activeChase &&
        runsRemaining != null &&
        ballsRemaining != null &&
        targetRuns != null ? (
          <div className="space-y-3 rounded-xl border border-outline bg-surface-container p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="pl-2 text-base font-medium tracking-wide text-on-surface-muted">
                <span className="font-bold text-on-surface">
                  {score.battingTeam.name}
                </span>{" "}
                need{" "}
                <span className="font-semibold text-on-surface-variant">
                  {runsRemaining}
                </span>{" "}
                off{" "}
                <span className="font-semibold text-on-surface-variant">
                  {ballsRemaining}
                </span>{" "}
                balls
              </p>
              <span className="inline-flex items-center gap-2 rounded-lg border border-outline/70 bg-surface px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wider text-on-surface-muted">
                Target{" "}
                <span className="text-xl leading-none text-on-surface-variant">
                  {targetRuns}
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {score.isMatchCompleted && resultText ? (
        <div className="space-y-2">
          <div className="rounded-xl border border-success/35 bg-success-container px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-on-success-container">
            {resultText}
          </div>
          {playerOfMatchQuery.data?.winner ? (
            <div className="rounded-xl border border-outline bg-surface px-4 py-3">
              <p className="font-display text-2xs font-bold tracking-widest uppercase text-on-surface-muted">
                Player of the match
              </p>
              <p className="mt-1 font-display text-lg font-bold text-on-surface">
                {playerOfMatchQuery.data.winner.name}
              </p>
              <p className="mt-1 text-sm text-on-surface-muted">
                {playerOfMatchQuery.data.winner.team?.name ?? "Team"} ·{" "}
                <span className="font-semibold text-on-primary-container">
                  {playerOfMatchQuery.data.winner.points}
                </span>{" "}
                pts
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
};
