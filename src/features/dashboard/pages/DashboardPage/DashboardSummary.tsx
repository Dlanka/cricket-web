import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { Button, ButtonLink } from "@/components/ui/button/Button";
import { StatusBadge } from "@/shared/components/status/StatusBadge";
import { Card } from "@/shared/components/card/Card";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { useTournamentsList } from "@/features/tournaments/hooks/useTournamentsList";
import { useTournament } from "@/features/tournaments/hooks/useTournament";
import { useTournamentMatchesQuery } from "@/features/fixtures/hooks/useTournamentMatchesQuery";
import { useTournamentStandingsQuery } from "@/features/tournaments/hooks/useTournamentStandingsQuery";
import { useTournamentBracketFixturesQuery } from "@/features/fixtures/hooks/useTournamentBracketFixturesQuery";
import { useTeamsByTournamentQuery } from "@/features/teams/hooks/useTeamsByTournamentQuery";
import { getRoster } from "@/features/roster/services/roster.service";
import type { TenantSummary, UserSummary } from "@/features/auth/types/authTypes";
import type { TournamentType } from "@/features/tournaments/types/tournamentTypes";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";

type Props = {
  user: UserSummary | null;
  tenant: TenantSummary | null;
  role: string | null;
};

const stageOrder = ["R1", "QF", "SF", "FINAL"] as const;

const pickActiveTournament = <T extends { status: string }>(items: T[]) =>
  items.find((item) => item.status === "ACTIVE") ?? items[0] ?? null;

const toTimestamp = (value?: string | null) => {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
};

const getStageStatusLabel = (value?: string) => {
  if (!value) return "Pending";
  if (value === "COMPLETED") return "Completed";
  if (value === "ACTIVE") return "Active";
  return "Pending";
};

const isLeagueType = (type?: TournamentType) =>
  type === "LEAGUE" || type === "LEAGUE_KNOCKOUT";

const isKnockoutType = (type?: TournamentType) =>
  type === "KNOCKOUT" || type === "LEAGUE_KNOCKOUT";

export const DashboardSummary = ({ user, tenant, role }: Props) => {
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const tournamentsQuery = useTournamentsList();
  const activeTournament = useMemo(
    () => pickActiveTournament(tournamentsQuery.data ?? []),
    [tournamentsQuery.data],
  );
  const tournamentId = activeTournament?.id ?? "";

  const tournamentQuery = useTournament(tournamentId);
  const type = (tournamentQuery.data?.type ?? activeTournament?.type) as
    | TournamentType
    | undefined;

  const matchesQuery = useTournamentMatchesQuery(tournamentId, {
    enabled: Boolean(tournamentId),
    refetchInterval: 45000,
  });
  const teamsQuery = useTeamsByTournamentQuery(tournamentId);
  const standingsQuery = useTournamentStandingsQuery(tournamentId, {
    enabled: Boolean(tournamentId) && isLeagueType(type),
    refetchInterval: 60000,
  });
  const bracketQuery = useTournamentBracketFixturesQuery(tournamentId, {
    enabled: Boolean(tournamentId) && isKnockoutType(type),
    refetchInterval: 45000,
  });

  const canScore = can("score.write");

  const matches = useMemo(() => matchesQuery.data ?? [], [matchesQuery.data]);
  const liveMatches = matches.filter((match) => match.status === "LIVE");
  const scheduledMatches = useMemo(
    () =>
      matches
        .filter((match) => match.status === "SCHEDULED")
        .sort(
          (a, b) =>
            toTimestamp(a.scheduledAt ?? a.createdAt) -
            toTimestamp(b.scheduledAt ?? b.createdAt),
        ),
    [matches],
  );
  const upcomingMatches = scheduledMatches.slice(0, 5);
  const completedMatches = matches.filter(
    (match) => match.status === "COMPLETED",
  );
  const pendingMatches = matches.filter(
    (match) => match.status !== "COMPLETED",
  );
  const knockoutMatches = matches.filter((match) => match.stage !== "LEAGUE");
  const hasKnockoutRoundsStarted = knockoutMatches.length > 0;

  const rosterCheckCandidates = useMemo(
    () => [...liveMatches, ...upcomingMatches].slice(0, 6),
    [liveMatches, upcomingMatches],
  );

  const rosterChecks = useQueries({
    queries: rosterCheckCandidates.map((match) => ({
      queryKey: ["dashboard", "roster-check", match.id],
      queryFn: () => getRoster(match.id),
      enabled: Boolean(tournamentId),
      staleTime: 15000,
    })),
  });

  const missingRosterMatches = useMemo(
    () =>
      rosterCheckCandidates.filter((match, index) => {
        const roster = rosterChecks[index]?.data;
        if (!roster) return false;

        const hasPlayingTeamA = roster.teams
          .find((team) => team.teamId === (match.teamAId ?? match.teamA.id))
          ?.players.some((player) => player.isPlaying);
        const teamBId = match.teamBId ?? match.teamB?.id;
        const hasPlayingTeamB = teamBId
          ? roster.teams
              .find((team) => team.teamId === teamBId)
              ?.players.some((player) => player.isPlaying)
          : true;

        return !hasPlayingTeamA || !hasPlayingTeamB;
      }),
    [rosterCheckCandidates, rosterChecks],
  );

  const liveStuckMatches = useMemo(
    () =>
      liveMatches.filter((match) => {
        const referenceTime = toTimestamp(match.scheduledAt ?? match.createdAt);
        if (referenceTime === Number.MAX_SAFE_INTEGER) return false;
        return matchesQuery.dataUpdatedAt - referenceTime > 1000 * 60 * 180;
      }),
    [liveMatches, matchesQuery.dataUpdatedAt],
  );

  const stageStatus = useMemo(() => {
    const base = tournamentQuery.data?.stageStatus;
    if (base?.league || base?.knockout) return base;

    const league = !isLeagueType(type)
      ? "PENDING"
      : standingsQuery.data?.leagueCompleted
        ? "COMPLETED"
        : matches.some((match) => match.stage === "LEAGUE")
          ? "ACTIVE"
          : "PENDING";
    const knockout = !isKnockoutType(type)
      ? "PENDING"
      : knockoutMatches.length === 0
        ? "PENDING"
        : knockoutMatches.every((match) => match.status === "COMPLETED")
          ? "COMPLETED"
          : "ACTIVE";

    return { league, knockout };
  }, [
    matches,
    knockoutMatches,
    standingsQuery.data?.leagueCompleted,
    tournamentQuery.data?.stageStatus,
    type,
  ]);

  if (tournamentsQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 mt-5">
        <Card className="h-40 animate-pulse bg-neutral-95">
          <div />
        </Card>
        <Card className="h-28 animate-pulse bg-neutral-95">
          <div />
        </Card>
        <Card className="h-28 animate-pulse bg-neutral-95">
          <div />
        </Card>
      </div>
    );
  }

  if (!activeTournament) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 mt-5">
        <EmptyState
          title="No active tournament"
          description="Create a tournament to start managing fixtures, standings, and live scoring."
          action={
            <ButtonLink to="/tournaments" size="sm">
              Create tournament
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const showStandings = isLeagueType(type);
  const showBracket = isKnockoutType(type);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-3xl p-4 mt-5 pb-8">
      <Card className="rounded-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
          Dashboard
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-primary-10">
          Welcome back{user?.name ? `, ${user.name}` : ""}.
        </h1>
        <p className="mt-2 text-sm text-neutral-40">
          {tenant?.name ?? "Tenant"} • {role ?? "Unknown role"}
        </p>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
              Tournament Snapshot
            </p>
            <h2 className="mt-2 text-xl font-semibold text-primary-10">
              {activeTournament.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={activeTournament.status} />
              {type ? (
                <StatusBadge status={type} label={type.replace("_", " ")} />
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            size="sm"
            onClick={() =>
              navigate({
                to: "/tournaments/$tournamentId",
                params: { tournamentId },
              })
            }
          >
            View tournament
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <p className="text-xs text-neutral-40">League stage</p>
            <p className="text-sm font-semibold text-primary-10">
              {getStageStatusLabel(stageStatus?.league)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-40">Knockout stage</p>
            <p className="text-sm font-semibold text-primary-10">
              {getStageStatusLabel(stageStatus?.knockout)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-40">Teams</p>
            <p className="text-sm font-semibold text-primary-10">
              {teamsQuery.data?.length ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-40">Total matches</p>
            <p className="text-sm font-semibold text-primary-10">
              {matches.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-40">Completed</p>
            <p className="text-sm font-semibold text-primary-10">
              {completedMatches.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-40">Pending</p>
            <p className="text-sm font-semibold text-primary-10">
              {pendingMatches.length}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
          Live Matches
        </p>
        {liveMatches.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-40">
            No live matches at the moment.
          </p>
        ) : (
          <div className="mt-3 grid gap-3">
            {liveMatches.map((match) => (
              <div
                key={match.id}
                className="rounded-xl border border-neutral-90 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary-10">
                      {match.teamA.shortName ?? match.teamA.name} vs{" "}
                      {match.teamB?.shortName ?? match.teamB?.name ?? "TBD"}
                    </p>
                    <p className="text-xs text-neutral-40">{match.stage}</p>
                  </div>
                  <ButtonLink
                    to={`/matches/${match.id}/score`}
                    size="sm"
                    appearance={canScore ? "filled" : "outline"}
                    color={canScore ? "primary" : "neutral"}
                  >
                    {canScore ? "Continue scoring" : "View score"}
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
          Today / Upcoming Matches
        </p>
        {upcomingMatches.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-40">No scheduled matches.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-90 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-primary-10">
                    {match.teamA.shortName ?? match.teamA.name} vs{" "}
                    {match.teamB?.shortName ?? match.teamB?.name ?? "TBD"}
                  </p>
                  <p className="text-xs text-neutral-40">
                    {match.scheduledAt
                      ? new Date(match.scheduledAt).toLocaleString()
                      : "Schedule pending"}{" "}
                    • {match.stage}
                  </p>
                </div>
                <StatusBadge status={match.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {showStandings ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
              Standings
            </p>
            <Button
              type="button"
              size="sm"
              appearance="outline"
              color="neutral"
              onClick={() =>
                navigate({
                  to: "/tournaments/$tournamentId/standings",
                  params: { tournamentId },
                })
              }
            >
              View full standings
            </Button>
          </div>
          {standingsQuery.isLoading ? (
            <p className="mt-3 text-sm text-neutral-40">Loading standings...</p>
          ) : standingsQuery.data?.items?.length ? (
            <div className="mt-3 space-y-2">
              {standingsQuery.data.items.slice(0, 5).map((row) => (
                <div
                  key={row.team.id}
                  className="grid grid-cols-[40px_1fr_80px_80px] items-center gap-2 rounded-lg border border-neutral-90 px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-primary-10">
                    #{row.rank}
                  </span>
                  <span className="font-medium text-primary-10">
                    {row.team.shortName ?? row.team.name}
                  </span>
                  <span className="text-right font-semibold text-primary-10">
                    {row.points} pts
                  </span>
                  <span className="text-right text-neutral-40">
                    NRR {row.netRunRate.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-40">
              No standings data yet.
            </p>
          )}
        </Card>
      ) : null}

      {showBracket ? (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
            Knockout Bracket Preview
          </p>
          {bracketQuery.data?.rounds?.length ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-4">
              {[...bracketQuery.data.rounds]
                .sort(
                  (a, b) =>
                    stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage),
                )
                .map((round) => (
                  <div
                    key={`${round.stage}-${round.roundNumber}`}
                    className="space-y-2 rounded-xl border border-neutral-90 p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-40">
                      {round.stage}
                    </p>
                    {round.fixtures.map((fixture) => (
                      <div
                        key={`${round.stage}-${fixture.slot}`}
                        className="rounded-lg border border-neutral-90 p-2 text-xs"
                      >
                        {fixture.isPlaceholder ? (
                          <p className="text-neutral-40">TBD vs TBD</p>
                        ) : (
                          <>
                            <p
                              className={
                                fixture.winnerTeamId === fixture.teamA?.id
                                  ? "font-semibold text-success-20"
                                  : "text-primary-10"
                              }
                            >
                              {fixture.teamA?.shortName ??
                                fixture.teamA?.name ??
                                "TBD"}
                            </p>
                            <p
                              className={
                                fixture.winnerTeamId === fixture.teamB?.id
                                  ? "font-semibold text-success-20"
                                  : "text-primary-10"
                              }
                            >
                              {fixture.teamB?.shortName ??
                                fixture.teamB?.name ??
                                "TBD"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <StatusBadge
                                status={fixture.status}
                                className="px-2 py-0.5 text-[10px]"
                              />
                              {fixture.isBye ? (
                                <span className="rounded-full border border-warning-80 bg-warning-95 px-2 py-0.5 text-[10px] font-semibold text-warning-30">
                                  BYE
                                </span>
                              ) : null}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-40">
              No bracket fixtures yet.
            </p>
          )}
        </Card>
      ) : null}

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
          Alerts / Attention Needed
        </p>
        <div className="mt-3 space-y-2">
          {missingRosterMatches.slice(0, 3).map((match) => (
            <div
              key={`roster-${match.id}`}
              className="rounded-lg border border-warning-80 bg-warning-95 px-3 py-2 text-sm text-warning-30"
            >
              Roster missing for {match.teamA.shortName ?? match.teamA.name} vs{" "}
              {match.teamB?.shortName ?? match.teamB?.name ?? "TBD"}.
              <Link
                to="/tournaments/$tournamentId/matches/$matchId/roster"
                params={{ tournamentId, matchId: match.id }}
                search={{
                  teamAId: match.teamAId ?? match.teamA.id,
                  teamBId: match.teamBId ?? match.teamB?.id ?? "",
                  teamAName: match.teamA.name,
                  teamBName: match.teamB?.name ?? "Team B",
                }}
                className="ml-2 underline"
              >
                Set roster
              </Link>
            </div>
          ))}

          {type === "LEAGUE_KNOCKOUT" &&
          standingsQuery.data?.leagueCompleted &&
          !hasKnockoutRoundsStarted ? (
            <div className="rounded-lg border border-warning-80 bg-warning-95 px-3 py-2 text-sm text-warning-30">
              League stage is complete. Knockout fixtures are pending.
            </div>
          ) : null}

          {liveStuckMatches.slice(0, 1).map((match) => (
            <div
              key={`stuck-${match.id}`}
              className="rounded-lg border border-error-80 bg-error-95 px-3 py-2 text-sm text-error-30"
            >
              Live match may require attention:{" "}
              {match.teamA.shortName ?? match.teamA.name} vs{" "}
              {match.teamB?.shortName ?? match.teamB?.name ?? "TBD"}.
              <Link
                to="/matches/$matchId/score"
                params={{ matchId: match.id }}
                className="ml-2 underline"
              >
                Open scoring
              </Link>
            </div>
          ))}

          {missingRosterMatches.length === 0 &&
          !(
            type === "LEAGUE_KNOCKOUT" &&
            standingsQuery.data?.leagueCompleted &&
            !hasKnockoutRoundsStarted
          ) &&
          liveStuckMatches.length === 0 ? (
            <p className="text-sm text-neutral-40">
              No immediate issues detected.
            </p>
          ) : null}
        </div>
      </Card>

      {matchesQuery.isError ? (
        <p className="text-sm text-error-40">
          {normalizeApiError(matchesQuery.error).message ||
            "Unable to load matches."}
        </p>
      ) : null}
    </div>
  );
};
