import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { TournamentStandingsSection } from "../../components/TournamentStandingsSection";
import { useTournament } from "../../hooks/useTournament";
import { useTournamentStandingsQuery } from "../../hooks/useTournamentStandingsQuery";
import { useRecomputeStandingsMutation } from "../../hooks/useRecomputeStandingsMutation";
import { useGenerateKnockoutMutation } from "../../hooks/useGenerateKnockoutMutation";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { useTournamentMatchesQuery } from "@/features/matches/hooks/useTournamentMatchesQuery";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";

const mapStandingsErrorMessage = (error: unknown) => {
  const normalized = normalizeApiError(error);
  switch (normalized.code) {
    case "tournament.not_found":
      return "Tournament not found.";
    case "tournament.unsupported_type":
      return "Standings/knockout not supported for this tournament type.";
    case "tournament.league_not_completed":
      return "Complete all league matches before generating knockout.";
    case "match.already_exists":
      return "Knockout fixtures already generated.";
    case "match.insufficient_teams":
      return "Not enough teams to generate knockout.";
    case "tournament.invalid_rules":
      return "Tournament qualification settings are invalid.";
    default:
      return normalized.message || "Unable to process standings.";
  }
};

export const TournamentStandingsPage = () => {
  const { tournamentId } = useParams({
    from: "/tournaments/$tournamentId/standings",
  });
  const { can } = useAuthorization();
  const canManageTournament = can("tournament.manage");
  const canGenerateFixtures = can("fixture.generate");
  const tournamentQuery = useTournament(tournamentId);
  const standingsQuery = useTournamentStandingsQuery(tournamentId);
  const matchesQuery = useTournamentMatchesQuery(tournamentId);
  const recomputeMutation = useRecomputeStandingsMutation(tournamentId);
  const generateKnockoutMutation = useGenerateKnockoutMutation(tournamentId);

  const isLeagueType =
    tournamentQuery.data?.type === "LEAGUE" ||
    tournamentQuery.data?.type === "LEAGUE_KNOCKOUT";
  const hasKnockoutRoundsStarted = (matchesQuery.data ?? []).some(
    (match) => match.stage && match.stage !== "LEAGUE",
  );
  const hasKnockoutStageStarted =
    tournamentQuery.data?.stageStatus?.knockout &&
    tournamentQuery.data.stageStatus.knockout !== "PENDING";

  const handleRecompute = async () => {
    try {
      const response = await recomputeMutation.mutateAsync();
      toast.success(`Standings recomputed (${response.rowCount} rows).`);
    } catch (error) {
      toast.error(mapStandingsErrorMessage(error));
    }
  };

  const handleGenerateKnockout = async () => {
    try {
      const response = await generateKnockoutMutation.mutateAsync();
      toast.success(`Knockout fixtures generated (${response.created.length}).`);
    } catch (error) {
      toast.error(mapStandingsErrorMessage(error));
    }
  };

  if (tournamentQuery.isLoading) {
    return <EmptyState title="Loading standings..." />;
  }

  if (!isLeagueType) {
    return (
      <EmptyState
        title="Standings unavailable"
        description="Points table is available only for League and League + Knockout tournaments."
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <TournamentStandingsSection
        standings={standingsQuery.data}
        isLoading={standingsQuery.isLoading}
        isError={standingsQuery.isError}
        errorMessage={
          standingsQuery.isError
            ? mapStandingsErrorMessage(standingsQuery.error)
            : null
        }
        canViewActions={canManageTournament || canGenerateFixtures}
        canRecompute={canManageTournament && isLeagueType}
        showGenerate={tournamentQuery.data?.type === "LEAGUE_KNOCKOUT"}
        canGenerate={
          canGenerateFixtures &&
          tournamentQuery.data?.type === "LEAGUE_KNOCKOUT" &&
          !hasKnockoutStageStarted &&
          !hasKnockoutRoundsStarted &&
          Boolean(standingsQuery.data?.leagueCompleted)
        }
        isRecomputing={recomputeMutation.isPending}
        isGenerating={generateKnockoutMutation.isPending}
        onRecompute={handleRecompute}
        onGenerate={handleGenerateKnockout}
      />
    </div>
  );
};
