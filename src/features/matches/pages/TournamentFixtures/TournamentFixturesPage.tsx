import { useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTournamentMatchesQuery } from "../../hooks/useTournamentMatchesQuery";
import { useGenerateFixturesMutation } from "../../hooks/useGenerateFixturesMutation";
import { TournamentFixturesPageSkeleton } from "./TournamentFixturesPage.skeleton";
import { MatchList } from "./MatchList";
import { Button } from "@/components/ui/button/Button";
import type { MatchSummary } from "../../types/matches.types";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";

const groupByStage = (matches: MatchSummary[]) =>
  matches.reduce<Record<string, MatchSummary[]>>((acc, match) => {
    const stage = match.stage || "LEAGUE";
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(match);
    return acc;
  }, {});

export const TournamentFixturesPage = () => {
  const { tournamentId } = useParams({
    from: "/tournaments/$tournamentId/fixtures",
  });
  const { can } = useAuthorization();
  const { data, isLoading, isError, error } =
    useTournamentMatchesQuery(tournamentId);
  const generateMutation = useGenerateFixturesMutation(tournamentId);

  const groupedMatches = useMemo(
    () => (data ? groupByStage(data) : {}),
    [data],
  );

  if (!tournamentId) {
    return (
      <div className="rounded-2xl border border-error/40 bg-error-container p-6 text-sm text-on-error-container shadow-surface-lg backdrop-blur">
        Missing tournament id.
      </div>
    );
  }

  if (isLoading) {
    return <TournamentFixturesPageSkeleton />;
  }

  const handleGenerateFixtures = async () => {
    try {
      await generateMutation.mutateAsync();
      toast.success("Fixtures generated.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to generate fixtures.";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto w-full space-y-12">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-muted">
          Fixtures
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-on-surface">
              Tournament fixtures
            </h1>
            <p className="mt-2 text-sm text-on-surface-muted">
              Track scheduled matches by stage.
            </p>
          </div>
          {can("fixture.generate") ? (
            <Button
              type="button"
              appearance="filled"
              color="primary"
              size="md"
              disabled={generateMutation.isPending}
              onClick={handleGenerateFixtures}
            >
              {generateMutation.isPending
                ? "Generating..."
                : "Generate fixtures"}
            </Button>
          ) : null}
        </div>
      </header>
      {isError ? (
        <div className="rounded-2xl border border-error/40 bg-error-container p-6 text-sm text-on-error-container shadow-surface-lg backdrop-blur">
          {error instanceof Error ? error.message : "Unable to load fixtures."}
        </div>
      ) : null}
      {data && data.length > 0 ? (
        <MatchList groups={groupedMatches} />
      ) : (
        <div className="rounded-2xl border border-outline bg-surface-container p-6 text-sm text-on-surface-muted">
          No fixtures yet for this tournament.
        </div>
      )}
    </div>
  );
};




