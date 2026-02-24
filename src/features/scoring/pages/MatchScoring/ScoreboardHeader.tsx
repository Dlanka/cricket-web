import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { Card } from "@/shared/components/card/Card";
import { calculateCRR } from "@/shared/utils/calculateCRR";
import { calculateRRR } from "@/shared/utils/calculateRRR";
import type { MatchScoreResponse } from "../../types/scoring.types";

type Props = {
  score: MatchScoreResponse;
  onBack?: () => void;
};

export const ScoreboardHeader = ({ score, onBack }: Props) => {
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

  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onBack ? (
              <Button
                type="button"
                appearance="standard"
                color="neutral"
                size="sm"
                className="-ml-3"
                onClick={onBack}
                aria-label="Back to fixtures"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
              Live score
            </p>
            {score.phase === "SUPER_OVER" ? (
              <span className="inline-flex rounded-full border border-warning-80 bg-warning-95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-warning-30">
                Super Over
              </span>
            ) : null}
          </div>
          <h2 className="mt-1 text-base font-semibold text-primary-10">
            {score.battingTeam.name} <span className="opacity-30">vs</span>{" "}
            {score.bowlingTeam.name}
          </h2>
          <p className="mt-1 flex items-center gap-2">
            <span className="text-3xl font-bold leading-none text-primary-10">
              {score.score.runs} - {score.score.wickets}
            </span>
            <span className="text-xl font-medium leading-none text-primary-50">
              ({score.score.overs})
            </span>
          </p>
          {isSecondInnings &&
          activeChase &&
          runsRemaining != null &&
          ballsRemaining != null ? (
            <p className="mt-3 text-base font-semibold text-primary-30">
              {score.battingTeam.name} need {runsRemaining} off {ballsRemaining}
            </p>
          ) : isSecondInnings ? (
            <p className="mt-3 text-sm font-semibold text-warning-30">
              Chase data unavailable
            </p>
          ) : null}
        </div>
        <div className="text-right">
          {isSecondInnings && activeChase && targetRuns != null ? (
            <>
              <p className="mb-3 inline-flex items-center text-lg font-bold text-primary-20">
                Target: {targetRuns}
              </p>
            </>
          ) : null}

          <p className="text-sm font-semibold text-neutral-30">
            CRR {crr.toFixed(2)}
            {isSecondInnings ? ` | RRR ${rrrValue}` : ""}
          </p>
        </div>
        {score.isMatchCompleted && resultText ? (
          <div className="w-full rounded-xl border border-success-80 bg-success-95 px-4 py-3 text-sm font-semibold text-success-30">
            {resultText}
          </div>
        ) : null}
      </div>
    </Card>
  );
};
