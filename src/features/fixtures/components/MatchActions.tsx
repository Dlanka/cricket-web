import { ButtonLink } from "@/components/ui/button/Button";
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
    match.result?.type ?? (match.result?.isNoResult ? "NO_RESULT" : null);
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
        <ButtonLink
          to="/tournaments/$tournamentId/matches/$matchId"
          params={{
            tournamentId,
            matchId: match.id,
          }}
          appearance="soft"
          color="primary"
          size="sm"
        >
          Start Super Over
        </ButtonLink>
      ) : null}
      {canResolveTie ? (
        <ButtonLink
          to="/tournaments/$tournamentId/matches/$matchId"
          params={{
            tournamentId,
            matchId: match.id,
          }}
          appearance="soft"
          color="warning"
          size="sm"
          uppercase
        >
          Resolve tie
        </ButtonLink>
      ) : null}
      {match.status === "SCHEDULED" && canStartMatch ? (
        <ButtonLink
          to="/tournaments/$tournamentId/matches/$matchId"
          params={{
            tournamentId,
            matchId: match.id,
          }}
          appearance="filled"
          color="primary"
          uppercase
          size="xs"
        >
          Start match
        </ButtonLink>
      ) : null}

      {match.status === "LIVE" ? (
        <ButtonLink
          to="/tournaments/$tournamentId/matches/$matchId/score"
          params={{
            tournamentId,
            matchId: match.id,
          }}
          appearance="filled"
          color="primary"
          size="xs"
          uppercase
        >
          Live score
        </ButtonLink>
      ) : null}

      {canEditRoster && match.status === "SCHEDULED" ? (
        <ButtonLink
          to="/tournaments/$tournamentId/matches/$matchId/roster"
          params={{
            tournamentId,
            matchId: match.id,
          }}
          search={buildRosterSearch(match)}
          appearance="soft"
          color="neutral"
          size="xs"
          uppercase
        >
          Set roster
        </ButtonLink>
      ) : match.status !== "COMPLETED" ? (
        <ButtonLink
          to="/tournaments/$tournamentId/matches/$matchId/roster"
          params={{
            tournamentId,
            matchId: match.id,
          }}
          search={buildRosterSearch(match)}
          appearance="soft"
          color="neutral"
          size="xs"
          uppercase
        >
          View roster
        </ButtonLink>
      ) : null}

      {match.status === "COMPLETED" || match.status === "LIVE" ? (
        <ButtonLink
          to="/tournaments/$tournamentId/matches/$matchId/summary"
          params={{
            tournamentId,
            matchId: match.id,
          }}
          appearance="soft"
          color="neutral"
          size="xs"
          uppercase
        >
          Summary
        </ButtonLink>
      ) : null}
    </>
  );
};
