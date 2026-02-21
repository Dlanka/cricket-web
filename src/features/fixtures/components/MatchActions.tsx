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
}: Props) => (
  <>
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

    {match.status === "COMPLETED" ? (
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
