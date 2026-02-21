import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { PageStateGate } from "@/shared/components/page/PageStateGate";
import { Card } from "@/shared/components/card/Card";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { useMatchQuery } from "@/features/matches/hooks/useMatchQuery";
import { useStartMatchMutation } from "@/features/matches/hooks/useStartMatchMutation";
import { useMatchRosterQuery } from "@/features/roster/hooks/useMatchRosterQuery";
import { usePlayersByTeamQuery } from "@/features/players/hooks/usePlayersByTeamQuery";
import { MatchStartPageSkeleton } from "./MatchStartPage.skeleton";
import { MatchStartForm } from "./MatchStartForm";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import type { StartMatchRequest } from "@/features/matches/types/matches.types";
import type { ApiError } from "@/shared/types/http.types";
import { getStartMatchErrorMessage } from "@/features/matches/utils/matchErrors";

type PlayerOption = {
  id: string;
  name: string;
};

const mapPlayingPlayers = (
  teamId: string,
  rosterTeams: ReturnType<typeof useMatchRosterQuery>["data"] | undefined,
  allPlayers: ReturnType<typeof usePlayersByTeamQuery>["data"] | undefined,
): PlayerOption[] => {
  const playingIds =
    rosterTeams?.teams
      .find((team) => team.teamId === teamId)
      ?.players.filter((player) => player.isPlaying)
      .map((player) => player.playerId) ?? [];

  const playerMap = new Map((allPlayers ?? []).map((player) => [player.id, player.fullName]));

  return Array.from(new Set(playingIds)).map((id) => ({
    id,
    name: playerMap.get(id) ?? id,
  }));
};

export const MatchStartPage = () => {
  const { tournamentId, matchId } = useParams({
    from: "/tournaments/$tournamentId/matches/$matchId/start",
  });
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const canStart = can("match.start");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const matchQuery = useMatchQuery(matchId);
  const rosterQuery = useMatchRosterQuery(matchId);
  const startMutation = useStartMatchMutation(matchId);

  const teamAId = matchQuery.data?.teams.teamA.id ?? "";
  const teamBId = matchQuery.data?.teams.teamB?.id ?? "";
  const teamAPlayersQuery = usePlayersByTeamQuery(teamAId);
  const teamBPlayersQuery = usePlayersByTeamQuery(teamBId);

  const teamAPlaying = useMemo(
    () => mapPlayingPlayers(teamAId, rosterQuery.data, teamAPlayersQuery.data),
    [teamAId, rosterQuery.data, teamAPlayersQuery.data],
  );
  const teamBPlaying = useMemo(
    () => mapPlayingPlayers(teamBId, rosterQuery.data, teamBPlayersQuery.data),
    [teamBId, rosterQuery.data, teamBPlayersQuery.data],
  );

  const isLoading =
    matchQuery.isLoading ||
    rosterQuery.isLoading ||
    (Boolean(teamAId) && teamAPlayersQuery.isLoading) ||
    (Boolean(teamBId) && teamBPlayersQuery.isLoading);
  const status =
    (matchQuery.error as ApiError | undefined)?.status ??
    (rosterQuery.error as ApiError | undefined)?.status;
  const isUnauthorized = status === 401;
  const loadErrorMessage =
    matchQuery.isError || rosterQuery.isError
      ? matchQuery.error instanceof Error
        ? matchQuery.error.message
        : rosterQuery.error instanceof Error
          ? rosterQuery.error.message
          : "Unable to load match start context."
      : null;

  const match = matchQuery.data;

  const handleStart = async (payload: StartMatchRequest) => {
    setSubmitError(null);
    try {
      await startMutation.mutateAsync(payload);
      toast.success("Match started.");
      navigate({
        to: "/tournaments/$tournamentId/matches/$matchId/score",
        params: { tournamentId, matchId },
      });
    } catch (error) {
      const status = (error as ApiError | undefined)?.status;
      if (status === 401) {
        window.location.assign("/login");
        return;
      }
      const message = getStartMatchErrorMessage(error, "Unable to start match.");
      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <PageStateGate
      isLoading={isLoading}
      loadingFallback={<MatchStartPageSkeleton />}
      isUnauthorized={isUnauthorized}
      errorMessage={loadErrorMessage}
      isNotFound={!match}
      notFoundMessage="Match not found."
    >
      {match ? (
        match.status !== "SCHEDULED" ? (
          <EmptyState
            title="Match already started"
            description="This match is not in scheduled state."
            action={
              <Link
                to="/tournaments/$tournamentId/matches/$matchId/score"
                params={{ tournamentId, matchId }}
                className="rounded-full border border-neutral-90 px-4 py-2 text-sm font-semibold text-primary-20"
              >
                Open score
              </Link>
            }
          />
        ) : teamAPlaying.length === 0 || teamBPlaying.length === 0 ? (
          <EmptyState
            title="Playing XI not set"
            description="Set roster before starting the match."
            action={
              <Link
                to="/tournaments/$tournamentId/matches/$matchId/roster"
                params={{ tournamentId, matchId }}
                search={{
                  teamAId: match.teams.teamA.id,
                  teamBId: match.teams.teamB?.id ?? "",
                  teamAName: match.teams.teamA.name,
                  teamBName: match.teams.teamB?.name ?? "Team B",
                }}
                className="rounded-full border border-neutral-90 px-4 py-2 text-sm font-semibold text-primary-20"
              >
                Set roster
              </Link>
            }
          />
        ) : (
          <div className="mx-auto w-full max-w-4xl space-y-6 px-6">
            <PageHeader
              eyebrow="Match start"
              title={`${match.teams.teamA.name} vs ${match.teams.teamB?.name ?? "BYE"}`}
              description="Select opening setup and begin scoring."
              backButton={{
                onClick: () =>
                  navigate({
                    to: "/tournaments/$tournamentId/fixtures",
                    params: { tournamentId },
                  }),
                ariaLabel: "Back to fixtures",
              }}
            />
            <Card>
              <MatchStartForm
                match={match}
                options={{
                  teamAPlayers: teamAPlaying,
                  teamBPlayers: teamBPlaying,
                }}
                isSubmitting={startMutation.isPending}
                canStart={canStart}
                onSubmit={handleStart}
                errorMessage={submitError}
              />
            </Card>
          </div>
        )
      ) : null}
    </PageStateGate>
  );
};
