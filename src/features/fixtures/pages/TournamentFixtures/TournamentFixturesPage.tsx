import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTournamentMatchesQuery } from "../../hooks/useTournamentMatchesQuery";
import { useGenerateFixturesMutation } from "../../hooks/useGenerateFixturesMutation";
import { useTournamentBracketFixturesQuery } from "../../hooks/useTournamentBracketFixturesQuery";
import { useTournamentFixturesViewQuery } from "../../hooks/useTournamentFixturesViewQuery";
import { useUpdateTournamentConfigMutation } from "../../hooks/useUpdateTournamentConfigMutation";
import { TournamentFixturesPageSkeleton } from "./TournamentFixturesPage.skeleton";
import { FixturesHeader } from "./FixturesHeader";
import { MatchList } from "./MatchList";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { useTeamsByTournamentQuery } from "@/features/teams/hooks/useTeamsByTournamentQuery";
import {
  canEditRoster,
  canGenerateFixtures,
  canStartMatch,
  mapMatchTeams,
} from "@/features/fixtures/utils/fixturesView";
import { useTournament } from "@/features/tournaments/hooks/useTournament";
import type { TournamentConfigInput } from "../../types/fixtures.types";
import { GenerateFixturesConfigModal } from "../../components/GenerateFixturesConfigModal";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";

const useFixturesViewV1 = import.meta.env.VITE_USE_FIXTURES_VIEW_V1 === "true";

export const TournamentFixturesPage = () => {
  const { tournamentId } = useParams({
    from: "/tournaments/$tournamentId/fixtures",
  });
  const { permissions } = useAuthorization();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const tournamentQuery = useTournament(tournamentId);
  const matchesQuery = useTournamentMatchesQuery(tournamentId, {
    enabled: !useFixturesViewV1,
  });
  const bracketQuery = useTournamentBracketFixturesQuery(tournamentId, {
    enabled: !useFixturesViewV1,
  });
  const fixturesViewQuery = useTournamentFixturesViewQuery(tournamentId, {
    enabled: useFixturesViewV1,
  });
  const teamsQuery = useTeamsByTournamentQuery(tournamentId);
  const updateConfigMutation = useUpdateTournamentConfigMutation(tournamentId);
  const generateMutation = useGenerateFixturesMutation(tournamentId);
  const matches = useFixturesViewV1
    ? (fixturesViewQuery.data?.matches ?? [])
    : (matchesQuery.data ?? []);
  const bracket = useFixturesViewV1
    ? {
        tournamentId: fixturesViewQuery.data?.tournamentId ?? tournamentId,
        tournamentType: fixturesViewQuery.data?.tournamentType ?? "LEAGUE",
        rounds: fixturesViewQuery.data?.bracket.rounds ?? [],
      }
    : bracketQuery.data;
  const isLoading =
    useFixturesViewV1 ? fixturesViewQuery.isLoading : matchesQuery.isLoading;
  const isError = useFixturesViewV1 ? fixturesViewQuery.isError : matchesQuery.isError;
  const error = useFixturesViewV1 ? fixturesViewQuery.error : matchesQuery.error;
  const mappedMatches = mapMatchTeams(matches, teamsQuery.data ?? []);
  const teamsCount = teamsQuery.data?.length ?? 0;
  const isSubmitting = updateConfigMutation.isPending || generateMutation.isPending;
  const hasStartedMatch = mappedMatches.some(
    (match) =>
      match.status === "LIVE" ||
      (match.status === "COMPLETED" && Boolean(match.teamBId)),
  );
  const isActionsLocked = hasStartedMatch || Boolean(blockedReason);

  if (!tournamentId) {
    return (
      <EmptyState title="Missing tournament id" />
    );
  }

  if (isLoading) {
    return <TournamentFixturesPageSkeleton />;
  }

  const regenerateFixtures = async () => {
    const response = await generateMutation.mutateAsync({ regenerate: true });
    if (useFixturesViewV1) {
      await fixturesViewQuery.refetch();
    } else {
      await Promise.all([matchesQuery.refetch(), bracketQuery.refetch()]);
    }
    await tournamentQuery.refetch();
    toast.success(`Fixtures regenerated (${response.createdCount}).`);
    setIsConfigModalOpen(false);
  };

  const handleGenerateWithConfig = async (payload: TournamentConfigInput) => {
    setErrorMessage(null);
    setBlockedReason(null);
    try {
      await updateConfigMutation.mutateAsync(payload);
      const response = await generateMutation.mutateAsync(undefined);
      if (useFixturesViewV1) {
        await fixturesViewQuery.refetch();
      } else {
        await Promise.all([matchesQuery.refetch(), bracketQuery.refetch()]);
      }
      await tournamentQuery.refetch();
      toast.success(`Fixtures generated (${response.createdCount}).`);
      setIsConfigModalOpen(false);
    } catch (err) {
      const normalized = normalizeApiError(err);
      if (normalized.status === 401) {
        window.location.assign("/login");
        return;
      }
      if (
        normalized.code === "match.already_exists" &&
        Boolean(
          normalized.details &&
            typeof normalized.details === "object" &&
            "canRegenerate" in normalized.details &&
            (normalized.details as { canRegenerate?: boolean }).canRegenerate,
        )
      ) {
        await regenerateFixtures();
        return;
      }
      if (normalized.code === "match.regenerate_blocked") {
        const message =
          "Cannot regenerate fixtures after a match has started or score data exists.";
        setBlockedReason(message);
        setErrorMessage(message);
        toast.error(message);
        return;
      }
      if (normalized.code === "tournament.type_locked") {
        const message = "Tournament type can't be changed after a match has started.";
        setBlockedReason(message);
        setErrorMessage(message);
        toast.error(message);
        return;
      }
      if (normalized.code === "tournament.config_locked") {
        const message =
          "Tournament format and over configuration are locked after scoring data exists.";
        setBlockedReason(message);
        setErrorMessage(message);
        toast.error(message);
        return;
      }
      if (
        ![
          "validation.failed",
          "tournament.invalid_rules",
          "tournament.config_locked",
          "tournament.type_locked",
          "match.already_exists",
          "match.regenerate_blocked",
        ].includes(normalized.code ?? "")
      ) {
        const message = normalized.message || "Unable to generate fixtures.";
        setErrorMessage(message);
        toast.error(message);
      }
      throw err;
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6">
      <FixturesHeader
        canGenerate={canGenerateFixtures(permissions)}
        isGenerateDisabled={isActionsLocked}
        isGenerating={isSubmitting}
        errorMessage={errorMessage ?? blockedReason}
        onGenerate={() => setIsConfigModalOpen(true)}
      />
      {isError ? (
        <EmptyState
          title="Unable to load fixtures"
          description={
            error instanceof Error ? error.message : "Please try again."
          }
        />
      ) : null}
      {mappedMatches.length > 0 ? (
        <MatchList
          matches={mappedMatches}
          bracket={bracket}
          canEditRoster={canEditRoster(permissions)}
          canStartMatch={canStartMatch(permissions)}
        />
      ) : null}
      {mappedMatches.length === 0 ? (
        <EmptyState
          title="No fixtures yet"
          description="Generate fixtures to start scheduling matches."
        />
      ) : null}
      {isConfigModalOpen ? (
        <GenerateFixturesConfigModal
          isOpen
          isLocked={isActionsLocked}
          isTypeLocked={false}
          isSubmitting={isSubmitting}
          teamsCount={teamsCount}
          initialValues={{
            type: tournamentQuery.data?.type,
            oversPerInnings: tournamentQuery.data?.oversPerInnings,
            ballsPerOver: tournamentQuery.data?.ballsPerOver,
            qualificationCount: tournamentQuery.data?.rules?.qualificationCount,
          }}
          onClose={() => setIsConfigModalOpen(false)}
          onSubmit={handleGenerateWithConfig}
        />
      ) : null}
    </div>
  );
};
