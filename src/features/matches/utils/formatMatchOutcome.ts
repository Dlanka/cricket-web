import type { MatchSummaryResult } from "@/features/matches/types/matchSummary.types";

export type MatchOutcomeBadge = "WIN" | "TIE" | "NO RESULT" | "PENDING";

type FormattedMatchOutcome = {
  badge: MatchOutcomeBadge;
  text: string;
};

const plural = (value: number, singular: string) =>
  `${value} ${singular}${value === 1 ? "" : "s"}`;

const normalizeOutcome = (result?: MatchSummaryResult | null) =>
  (result?.outcome ?? result?.type ?? null) as
    | "WIN"
    | "TIE"
    | "NO_RESULT"
    | string
    | null;

const normalizeBallsLeft = (result?: MatchSummaryResult | null) =>
  result?.ballsLeft ?? result?.ballsRemaining ?? null;

export const formatMatchOutcome = (
  result?: MatchSummaryResult | null,
): FormattedMatchOutcome => {
  const outcome = normalizeOutcome(result);
  const winner = result?.winnerTeamName || "Winner";
  const ballsLeft = normalizeBallsLeft(result);

  if (result?.message) {
    return {
      badge:
        outcome === "WIN"
          ? "WIN"
          : outcome === "TIE"
            ? "TIE"
            : outcome === "NO_RESULT"
              ? "NO RESULT"
              : "PENDING",
      text: result.message,
    };
  }

  if (outcome === "WIN") {
    if (typeof result?.winByWickets === "number") {
      if (typeof ballsLeft === "number") {
        return {
          badge: "WIN",
          text: `${winner} won by ${plural(result.winByWickets, "wicket")} (${plural(
            ballsLeft,
            "ball",
          )} left)`,
        };
      }
      return {
        badge: "WIN",
        text: `${winner} won by ${plural(result.winByWickets, "wicket")}`,
      };
    }
    if (typeof result?.winByRuns === "number") {
      return {
        badge: "WIN",
        text: `${winner} won by ${plural(result.winByRuns, "run")}`,
      };
    }
    return { badge: "WIN", text: `${winner} won` };
  }

  if (outcome === "TIE") {
    return { badge: "TIE", text: "Match tied" };
  }
  if (outcome === "NO_RESULT") {
    return { badge: "NO RESULT", text: "No result" };
  }

  return { badge: "PENDING", text: "Result pending" };
};

