import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import type { ApiError } from "@/shared/types/http.types";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { getForbiddenMessage } from "@/features/authz/utils/forbidden";
import { usePlayersByTeamQuery } from "@/features/players/hooks/usePlayersByTeamQuery";
import { useMatchRosterQuery } from "@/features/roster/hooks/useMatchRosterQuery";
import { useMatchScoreQuery } from "@/features/scoring/hooks/useMatchScoreQuery";
import { useMatchQuery } from "@/features/matches/hooks/useMatchQuery";
import { useStartMatchMutation } from "@/features/matches/hooks/useStartMatchMutation";
import { useUpdateMatchConfigMutation } from "@/features/matches/hooks/useUpdateMatchConfigMutation";
import type { StartMatchRequest } from "@/features/matches/types/matches.types";
import { getStartMatchErrorMessage } from "@/features/matches/utils/matchErrors";

type UseMatchCenterPageParams = {
  matchId: string;
  tournamentIdParam?: string;
};

export type PlayerOption = {
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

  const playerMap = new Map(
    (allPlayers ?? []).map((player) => [player.id, player.fullName]),
  );

  return Array.from(new Set(playingIds)).map((id) => ({
    id,
    name: playerMap.get(id) ?? id,
  }));
};

export const formatMatchStatus = (status: string) =>
  status === "LIVE" ? "Live" : status === "COMPLETED" ? "Completed" : "Scheduled";

export const useMatchCenterPage = ({
  matchId,
  tournamentIdParam,
}: UseMatchCenterPageParams) => {
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const canStart = can("match.start");
  const canEditConfig = can("tournament.manage");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configLocked, setConfigLocked] = useState(false);
  const [oversPerInningsDraft, setOversPerInningsDraft] = useState<
    string | null
  >(null);
  const [ballsPerOverDraft, setBallsPerOverDraft] = useState<string | null>(
    null,
  );

  const matchQuery = useMatchQuery(matchId);
  const rosterQuery = useMatchRosterQuery(matchId);
  const startMutation = useStartMatchMutation(matchId);
  const scoreQuery = useMatchScoreQuery(matchId, matchQuery.data?.status === "LIVE");

  const match = matchQuery.data;
  const teamAId = match?.teams.teamA.id ?? "";
  const teamBId = match?.teams.teamB?.id ?? "";
  const tournamentId = tournamentIdParam ?? match?.tournamentId ?? "";

  const updateConfigMutation = useUpdateMatchConfigMutation(matchId, tournamentId);
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

  const oversPerInningsInput =
    oversPerInningsDraft ?? String(match?.oversPerInnings ?? "");
  const ballsPerOverInput =
    ballsPerOverDraft ?? String(match?.ballsPerOver ?? "");
  const setOversPerInningsInput = (value: string) =>
    setOversPerInningsDraft(value);
  const setBallsPerOverInput = (value: string) => setBallsPerOverDraft(value);

  const isScheduled = match?.status === "SCHEDULED";
  const hasConfigChanges = Boolean(
    match &&
      (Number(oversPerInningsInput) !== match.oversPerInnings ||
        Number(ballsPerOverInput) !== match.ballsPerOver),
  );
  const isConfigInputDisabled =
    !canEditConfig ||
    !isScheduled ||
    configLocked ||
    updateConfigMutation.isPending ||
    startMutation.isPending;

  const isLoading =
    matchQuery.isLoading ||
    (isScheduled &&
      (rosterQuery.isLoading ||
        (Boolean(teamAId) && teamAPlayersQuery.isLoading) ||
        (Boolean(teamBId) && teamBPlayersQuery.isLoading)));

  const isUnauthorized = (matchQuery.error as ApiError | undefined)?.status === 401;
  const loadErrorMessage = matchQuery.isError
    ? matchQuery.error instanceof Error
      ? matchQuery.error.message
      : "Unable to load match center."
    : null;

  const handleStart = async (payload: StartMatchRequest) => {
    if (!match) return;

    setSubmitError(null);
    setConfigError(null);

    try {
      if (canEditConfig && hasConfigChanges) {
        const nextOvers = Number(oversPerInningsInput);
        const nextBalls = Number(ballsPerOverInput);

        if (
          !Number.isInteger(nextOvers) ||
          nextOvers <= 0 ||
          !Number.isInteger(nextBalls) ||
          nextBalls <= 0
        ) {
          setConfigError("Overs per innings and balls per over must be positive integers.");
          return;
        }

        await updateConfigMutation.mutateAsync({
          oversPerInnings: nextOvers,
          ballsPerOver: nextBalls,
        });
      }

      await startMutation.mutateAsync(payload);
      toast.success("Match started.");
      await Promise.all([matchQuery.refetch(), scoreQuery.refetch()]);
      navigate({
        to: "/tournaments/$tournamentId/matches/$matchId/score",
        params: { tournamentId: tournamentId || match.tournamentId, matchId },
      });
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "match.config_locked") {
        setConfigLocked(true);
        setConfigError("Match config is locked because innings or score events already exist.");
        return;
      }
      if (normalized.code === "match.invalid_state") {
        setConfigError("You can edit overs only while the match is scheduled.");
      }
      if (normalized.code === "validation.failed") {
        setConfigError("Please enter valid positive integer values.");
      }
      if (normalized.code === "auth.forbidden" || normalized.status === 403) {
        setConfigError(getForbiddenMessage(error));
      }
      if ((error as ApiError | undefined)?.status === 401) {
        window.location.assign("/login");
        return;
      }
      setSubmitError(getStartMatchErrorMessage(error, "Unable to start match."));
    }
  };

  return {
    match,
    tournamentId,
    canStart,
    canEditConfig,
    isScheduled,
    isLoading,
    isUnauthorized,
    loadErrorMessage,
    scoreQuery,
    teamAPlaying,
    teamBPlaying,
    submitError,
    configError,
    isConfigInputDisabled,
    oversPerInningsInput,
    ballsPerOverInput,
    setOversPerInningsInput,
    setBallsPerOverInput,
    handleStart,
    isStartSubmitting: startMutation.isPending || updateConfigMutation.isPending,
  };
};
