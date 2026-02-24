import { Link } from "@tanstack/react-router";
import type { MatchItem } from "../types/fixtures.types";

type Props = {
  match: MatchItem;
  tournamentId: string;
  canEditRoster: boolean;
  canStartMatch: boolean;
};

const buildRosterSearch = (match: MatchItem) => ({
  teamAId: match.teamAId ?? match.teamA?.id ?? "",
  teamBId: match.teamBId ?? match.teamB?.id ?? "",
  teamAName: match.teamA?.name ?? "Team A",
  teamBName: match.teamB?.name ?? "Team B",
});

export const MatchActions = ({
  match,
  tournamentId,
  canEditRoster,
  canStartMatch,
}: Props) => {
  const isKnockoutStage = ["R1", "QF", "SF", "FINAL"].includes(match.stage);
  const resultType =
    match.result?.type ??
    (match.result?.isNoResult ? "NO_RESULT" : null);
  const canResolveTie =
    canStartMatch &&
    isKnockoutStage &&
    match.status === "COMPLETED" &&
    resultType === "TIE" &&
    match.superOverStatus !== "PENDING" &&
    match.superOverStatus !== "LIVE";
  const canStartSuperOver =
    canStartMatch &&
    isKnockoutStage &&
    match.status === "COMPLETED" &&
    resultType === "TIE" &&
    (!match.superOverStatus || match.superOverStatus === "PENDING");

  return (
    <>
    {canStartSuperOver ? (
      <Link
        to="/tournaments/$tournamentId/matches/$matchId"
        params={{
          tournamentId,
          matchId: match.id,
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-80 bg-primary-95 px-4 py-2 text-sm font-semibold text-primary-30 transition hover:border-primary-70"
      >
        Start Super Over
      </Link>
    ) : null}
    {canResolveTie ? (
      <Link
        to="/tournaments/$tournamentId/matches/$matchId"
        params={{
          tournamentId,
          matchId: match.id,
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-warning-80 bg-warning-95 px-4 py-2 text-sm font-semibold text-warning-30 transition hover:border-warning-70"
      >
        Resolve tie
      </Link>
    ) : null}
    {match.status === "SCHEDULED" && canStartMatch ? (
      <Link
        to="/tournaments/$tournamentId/matches/$matchId"
        params={{
          tournamentId,
          matchId: match.id,
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-90 px-4 py-2 text-sm font-semibold text-primary-20 transition hover:border-neutral-80 hover:text-primary-10"
      >
        Start match
      </Link>
    ) : null}

    {match.status === "LIVE" ? (
      <Link
        to="/tournaments/$tournamentId/matches/$matchId/score"
        params={{
          tournamentId,
          matchId: match.id,
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-90 px-4 py-2 text-sm font-semibold text-primary-20 transition hover:border-neutral-80 hover:text-primary-10"
      >
        Live score
      </Link>
    ) : null}

    {canEditRoster && match.status === "SCHEDULED" ? (
      <Link
        to="/tournaments/$tournamentId/matches/$matchId/roster"
        params={{
          tournamentId,
          matchId: match.id,
        }}
        search={buildRosterSearch(match)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-90 px-4 py-2 text-sm font-semibold text-primary-20 transition hover:border-neutral-80 hover:text-primary-10"
      >
        Set roster
      </Link>
    ) : match.status !== "COMPLETED" ? (
      <Link
        to="/tournaments/$tournamentId/matches/$matchId/roster"
        params={{
          tournamentId,
          matchId: match.id,
        }}
        search={buildRosterSearch(match)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-90 px-4 py-2 text-sm font-semibold text-primary-20 transition hover:border-neutral-80 hover:text-primary-10"
      >
        View roster
      </Link>
    ) : null}

    {match.status === "COMPLETED" || match.status === "LIVE" ? (
      <Link
        to="/tournaments/$tournamentId/matches/$matchId/summary"
        params={{
          tournamentId,
          matchId: match.id,
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-90 px-4 py-2 text-sm font-semibold text-primary-20 transition hover:border-neutral-80 hover:text-primary-10"
      >
        Summary
      </Link>
    ) : null}
  </>
  );
};
