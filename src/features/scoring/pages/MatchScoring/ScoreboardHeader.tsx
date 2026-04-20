import { Card } from "@/shared/components/card/Card";
import { StatusPill } from "@/shared/components/badge/StatusPill";
import { calculateCRR } from "@/shared/utils/calculateCRR";
import { calculateRRR } from "@/shared/utils/calculateRRR";
import type { MatchScoreResponse } from "../../types/scoring.types";

type Props = {
  score: MatchScoreResponse;
};

export const ScoreboardHeader = ({ score }: Props) => {
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

  return (
    <Card className="space-y-5 border-outline-variant bg-surface-container p-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 bg-outline-strong" />
            <span className="size-1.5 rounded-full bg-primary" />
            <p className="font-display text-2xs font-bold tracking-widest uppercase text-on-surface-muted">
              Live score
            </p>
          </div>
          <StatusPill variant="info" size="sm">
            {inningsBadge}
          </StatusPill>
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
          <div className="space-y-3 rounded-xl border border-outline bg-primary-container/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-thin tracking-wide text-on-primary-container pl-2">
                {score.battingTeam.name} need{" "}
                <span className="font-bold text-primary">{runsRemaining}</span>{" "}
                off{" "}
                <span className="font-bold text-primary">{ballsRemaining}</span>{" "}
                balls
              </p>
              <span className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-surface-container px-3 py-1.5 font-display text-sm font-bold uppercase tracking-wider text-on-surface-muted">
                Target{" "}
                <span className="text-xl leading-none text-on-primary-container">
                  {targetRuns}
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {score.isMatchCompleted && resultText ? (
        <div className="rounded-xl border border-success/35 bg-success-container px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-on-success-container">
          {resultText}
        </div>
      ) : null}
    </Card>
  );
};
