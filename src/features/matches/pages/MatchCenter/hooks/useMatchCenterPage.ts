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
import { useSetMatchTossMutation } from "@/features/matches/hooks/useSetMatchTossMutation";
import { useResolveMatchTieMutation } from "@/features/matches/hooks/useResolveMatchTieMutation";
import { useStartSuperOverMutation } from "@/features/matches/hooks/useStartSuperOverMutation";
import type {
  SetMatchTossRequest,
  StartMatchRequest,
  StartSuperOverRequest,
} from "@/features/matches/types/matches.types";
import { getStartMatchErrorMessage } from "@/features/matches/utils/matchErrors";

type UseMatchCenterPageParams = {
  matchId: string;
  tournamentIdParam?: string;
};

type StartSuperOverFieldKey =
  | "teamA.strikerId"
  | "teamA.nonStrikerId"
  | "teamA.bowlerId"
  | "teamB.strikerId"
  | "teamB.nonStrikerId"
  | "teamB.bowlerId";

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
  const [tossError, setTossError] = useState<string | null>(null);
  const [resolveTieError, setResolveTieError] = useState<string | null>(null);
  const [startSuperOverError, setStartSuperOverError] = useState<string | null>(null);
  const [startSuperOverFieldErrors, setStartSuperOverFieldErrors] = useState<
    Partial<Record<StartSuperOverFieldKey, string>>
  >({});
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
  const setTossMutation = useSetMatchTossMutation(matchId, tournamentId);
  const resolveTieMutation = useResolveMatchTieMutation(matchId, tournamentId);
  const startSuperOverMutation = useStartSuperOverMutation(matchId, tournamentId);
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
  const isTossEditable = canStart && isScheduled && !startMutation.isPending;

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

  const handleSaveToss = async (payload: SetMatchTossRequest): Promise<boolean> => {
    setTossError(null);
    try {
      await setTossMutation.mutateAsync(payload);
      await matchQuery.refetch();
      toast.success("Toss saved.");
      return true;
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "match.invalid_state") {
        setTossError("Toss can be changed only before match starts.");
        return false;
      }
      if (normalized.code === "match.team_invalid" || normalized.code === "match.invalid_teams") {
        setTossError("Selected toss winner is not part of this match.");
        return false;
      }
      if (normalized.code === "auth.forbidden" || normalized.status === 403) {
        setTossError(getForbiddenMessage(error));
        return false;
      }
      if (normalized.code === "validation.failed") {
        setTossError("Please choose a valid toss winner and decision.");
        return false;
      }
      setTossError(normalized.message || "Unable to save toss.");
      return false;
    }
  };

  const handleResolveTie = async (winnerTeamId: string): Promise<boolean> => {
    setResolveTieError(null);
    try {
      const result = await resolveTieMutation.mutateAsync({ winnerTeamId });
      toast.success("Tie resolved.");
      if (result.progression?.created > 0) {
        toast.success(
          `Progression updated: ${result.progression.created} match(es) created for ${result.progression.stage ?? "next stage"}.`,
        );
      }
      await matchQuery.refetch();
      return true;
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "match.tie_break_not_applicable") {
        setResolveTieError("Tie-break allowed only for knockout matches.");
        return false;
      }
      if (normalized.code === "match.tie_break_not_allowed") {
        setResolveTieError("This match is not in tied state.");
        return false;
      }
      if (normalized.code === "match.super_over_pending") {
        setResolveTieError("Tie-break is available after Super Over completes.");
        return false;
      }
      if (normalized.code === "match.invalid_state") {
        setResolveTieError("Match must be completed first.");
        return false;
      }
      if (normalized.code === "match.team_invalid") {
        setResolveTieError("Selected winner is invalid for this match.");
        return false;
      }
      if (normalized.code === "auth.forbidden" || normalized.status === 403) {
        setResolveTieError(getForbiddenMessage(error));
        return false;
      }
      setResolveTieError(normalized.message || "Unable to resolve tie.");
      return false;
    }
  };

  const handleStartSuperOver = async (
    payload: StartSuperOverRequest,
  ): Promise<boolean> => {
    setStartSuperOverError(null);
    setStartSuperOverFieldErrors({});
    try {
      await startSuperOverMutation.mutateAsync(payload);
      toast.success("Super Over started.");
      await Promise.all([matchQuery.refetch(), scoreQuery.refetch()]);
      if (tournamentId) {
        navigate({
          to: "/tournaments/$tournamentId/matches/$matchId/score",
          params: { tournamentId, matchId },
        });
      }
      return true;
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "match.super_over_not_applicable") {
        setStartSuperOverError("Super Over is available only for tied knockout matches.");
        return false;
      }
      if (normalized.code === "match.super_over_already_started") {
        setStartSuperOverError("Super Over already started. Redirecting to scoring...");
        if (tournamentId) {
          navigate({
            to: "/tournaments/$tournamentId/matches/$matchId/score",
            params: { tournamentId, matchId },
          });
        }
        return false;
      }
      if (normalized.code === "match.super_over_pending") {
        setStartSuperOverError("Super Over is pending or already live.");
        return false;
      }
      if (normalized.code === "match.super_over_invalid_state") {
        setStartSuperOverError("Invalid super over setup. Refresh and try again.");
        await matchQuery.refetch();
        return false;
      }
      if (normalized.code === "match.super_over_player_invalid") {
        const details = normalized.details as
          | { issues?: Array<{ path?: string | string[]; message?: string }> }
          | undefined;
        const nextFieldErrors: Partial<Record<StartSuperOverFieldKey, string>> = {};
        for (const issue of details?.issues ?? []) {
          const pathValue = issue.path;
          const normalizedPath = Array.isArray(pathValue)
            ? pathValue.join(".")
            : pathValue;
          if (
            normalizedPath === "teamA.strikerId" ||
            normalizedPath === "teamA.nonStrikerId" ||
            normalizedPath === "teamA.bowlerId" ||
            normalizedPath === "teamB.strikerId" ||
            normalizedPath === "teamB.nonStrikerId" ||
            normalizedPath === "teamB.bowlerId"
          ) {
            const fallbackMessage =
              normalizedPath === "teamA.bowlerId" || normalizedPath === "teamB.bowlerId"
                ? "Selected bowler must belong to opposition Playing XI."
                : "Player not in Playing XI for this team.";
            nextFieldErrors[normalizedPath] = issue.message || fallbackMessage;
          }
        }
        if (Object.keys(nextFieldErrors).length > 0) {
          setStartSuperOverFieldErrors(nextFieldErrors);
        } else {
          setStartSuperOverError(
            "One or more selected players are invalid for Super Over. Re-select from Playing XI.",
          );
        }
        return false;
      }
      if (normalized.code === "match.bowler_invalid") {
        setStartSuperOverError(
          "Selected bowler must belong to opposition Playing XI for that batting side.",
        );
        return false;
      }
      if (normalized.code === "validation.failed") {
        const details = normalized.details as
          | { issues?: Array<{ message?: string }> }
          | undefined;
        const firstIssue = details?.issues?.[0]?.message;
        if (firstIssue) {
          setStartSuperOverError(firstIssue);
          return false;
        }
      }
      if (normalized.code === "match.invalid_state") {
        setStartSuperOverError("Super Over can be started only after a completed tied match.");
        return false;
      }
      if (normalized.code === "auth.forbidden" || normalized.status === 403) {
        setStartSuperOverError(getForbiddenMessage(error));
        return false;
      }
      setStartSuperOverError(normalized.message || "Unable to start Super Over.");
      return false;
    }
  };

  const refreshRosterData = async () => {
    await Promise.all([
      rosterQuery.refetch(),
      teamAPlayersQuery.refetch(),
      teamBPlayersQuery.refetch(),
    ]);
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
    tossError,
    resolveTieError,
    startSuperOverError,
    startSuperOverFieldErrors,
    isTossEditable,
    isConfigInputDisabled,
    oversPerInningsInput,
    ballsPerOverInput,
    setOversPerInningsInput,
    setBallsPerOverInput,
    handleSaveToss,
    handleResolveTie,
    handleStartSuperOver,
    refreshRosterData,
    handleStart,
    isStartSubmitting:
      startMutation.isPending || updateConfigMutation.isPending || setTossMutation.isPending,
    isTossSubmitting: setTossMutation.isPending,
    isResolveTieSubmitting: resolveTieMutation.isPending,
    isStartSuperOverSubmitting: startSuperOverMutation.isPending,
    isRefreshingRoster:
      rosterQuery.isFetching || teamAPlayersQuery.isFetching || teamBPlayersQuery.isFetching,
  };
};
