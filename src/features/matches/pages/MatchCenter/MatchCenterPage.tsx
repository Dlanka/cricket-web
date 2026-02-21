import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { PageStateGate } from "@/shared/components/page/PageStateGate";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { MatchCenterLiveContextCard } from "./components/MatchCenterLiveContextCard";
import { MatchCenterScheduledCard } from "./components/MatchCenterScheduledCard";
import { MatchCenterSummaryCard } from "./components/MatchCenterSummaryCard";
import { MatchCenterPageSkeleton } from "./MatchCenterPage.skeleton";
import { useMatchCenterPage } from "./hooks/useMatchCenterPage";

type MatchCenterPageProps = {
  matchId: string;
  tournamentIdParam?: string;
};

export const MatchCenterPage = ({
  matchId,
  tournamentIdParam,
}: MatchCenterPageProps) => {
  const navigate = useNavigate();
  const vm = useMatchCenterPage({ matchId, tournamentIdParam });
  const match = vm.match;

  return (
    <PageStateGate
      isLoading={vm.isLoading}
      loadingFallback={<MatchCenterPageSkeleton />}
      isUnauthorized={vm.isUnauthorized}
      errorMessage={vm.loadErrorMessage}
      isNotFound={!match}
      notFoundMessage="Match not found."
    >
      {match ? (
        <div className="mx-auto w-full max-w-5xl space-y-6 px-6">
          <PageHeader
            eyebrow="Match center"
            title={`${match.teams.teamA.name} vs ${match.teams.teamB?.name ?? "BYE"}`}
            description="Manage roster, start state, and live context."
            backButton={
              vm.tournamentId
                ? {
                    onClick: () =>
                      navigate({
                        to: "/tournaments/$tournamentId/fixtures",
                        params: { tournamentId: vm.tournamentId },
                      }),
                    ariaLabel: "Back to fixtures",
                  }
                : undefined
            }
          />

          <MatchCenterSummaryCard stage={match.stage} status={match.status} />

          {match.status === "SCHEDULED" ? (
            <MatchCenterScheduledCard
              match={match}
              matchId={matchId}
              canEditConfig={vm.canEditConfig}
              canStart={vm.canStart}
              isConfigInputDisabled={vm.isConfigInputDisabled}
              oversPerInningsInput={vm.oversPerInningsInput}
              ballsPerOverInput={vm.ballsPerOverInput}
              setOversPerInningsInput={vm.setOversPerInningsInput}
              setBallsPerOverInput={vm.setBallsPerOverInput}
              configError={vm.configError}
              submitError={vm.submitError}
              teamAPlaying={vm.teamAPlaying}
              teamBPlaying={vm.teamBPlaying}
              isStartSubmitting={vm.isStartSubmitting}
              onStart={vm.handleStart}
            />
          ) : null}

          {match.status === "LIVE" ? (
            <MatchCenterLiveContextCard
              isLoading={vm.scoreQuery.isLoading}
              score={vm.scoreQuery.data}
            />
          ) : null}

          {!vm.isScheduled && match.status !== "LIVE" ? (
            <EmptyState
              title="Match status updated"
              description="Match center actions are available for Scheduled and Live states."
            />
          ) : null}
        </div>
      ) : null}
    </PageStateGate>
  );
};
