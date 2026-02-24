import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { PageStateGate } from "@/shared/components/page/PageStateGate";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Card } from "@/shared/components/card/Card";
import { MatchCenterLiveContextCard } from "./components/MatchCenterLiveContextCard";
import { MatchCenterScheduledCard } from "./components/MatchCenterScheduledCard";
import { MatchCenterSummaryCard } from "./components/MatchCenterSummaryCard";
import { MatchCenterTossCard } from "./components/MatchCenterTossCard";
import { ResolveTieModal } from "./components/ResolveTieModal";
import { StartSuperOverModal } from "./components/StartSuperOverModal";
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
  const hasRosterConfigured =
    vm.teamAPlaying.length > 0 && vm.teamBPlaying.length > 0;
  const [scheduledStep, setScheduledStep] = useState<"toss" | "setup">("toss");
  const [isTieModalOpen, setIsTieModalOpen] = useState(false);
  const [isSuperOverModalOpen, setIsSuperOverModalOpen] = useState(false);

  useEffect(() => {
    setScheduledStep("toss");
  }, [matchId, hasRosterConfigured]);

  const isKnockoutStage = ["R1", "QF", "SF", "FINAL"].includes(match?.stage ?? "");
  const regularMatchResultType =
    match?.result?.type ??
    (match?.status === "COMPLETED" &&
    match?.teams.teamB &&
    !match.result?.winnerTeamId
      ? "TIE"
      : null);
  const canStartSuperOver = Boolean(
    match &&
      vm.canStart &&
      isKnockoutStage &&
      match.status === "COMPLETED" &&
      regularMatchResultType === "TIE" &&
      (!match.superOverStatus || match.superOverStatus === "PENDING"),
  );
  const regularBattingFirstTeamId = match?.toss
    ? match.toss.decision === "BAT"
      ? match.toss.wonByTeamId
      : match.toss.wonByTeamId === match.teams.teamA.id
        ? match.teams.teamB?.id ?? null
        : match.teams.teamA.id
    : null;
  const canDetermineSuperOverOrder = Boolean(regularBattingFirstTeamId);
  const teamABattingFirstInSuperOver =
    regularBattingFirstTeamId != null
      ? regularBattingFirstTeamId !== match?.teams.teamA.id
      : false;
  const canResolveTie = Boolean(
    match &&
      vm.canStart &&
      isKnockoutStage &&
      match.status === "COMPLETED" &&
      (match.superOver?.isTie ||
        (regularMatchResultType === "TIE" &&
          match.superOverStatus !== "PENDING" &&
          match.superOverStatus !== "LIVE")),
  );

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
        <div className="mx-auto w-full max-w-4xl space-y-6 px-6">
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

          <MatchCenterSummaryCard
            stage={match.stage}
            status={match.status}
            phase={match.phase}
            hasSuperOver={match.hasSuperOver}
            superOverStatus={match.superOverStatus}
          />
          {canStartSuperOver ? (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
                    Super Over
                  </p>
                  <p className="mt-1 text-sm text-neutral-40">
                    Match is tied. Start Super Over to decide the winner.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsSuperOverModalOpen(true)}
                  disabled={vm.isStartSuperOverSubmitting || !canDetermineSuperOverOrder}
                >
                  Start Super Over
                </Button>
              </div>
              {vm.startSuperOverError ? (
                <div className="mt-3 rounded-xl border border-error-80 bg-error-95 px-3 py-2 text-xs text-error-40">
                  {vm.startSuperOverError}
                </div>
              ) : null}
            </Card>
          ) : null}
          {canResolveTie ? (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
                    Tie-break
                  </p>
                  <p className="mt-1 text-sm text-neutral-40">
                    Match ended as a tie. Select winner to progress knockout stage.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsTieModalOpen(true)}
                  disabled={vm.isResolveTieSubmitting}
                >
                  Resolve tie
                </Button>
              </div>
            </Card>
          ) : null}

          {match.status === "SCHEDULED" ? (
            <>
              {!hasRosterConfigured ? (
                <EmptyState
                  title="Playing XI not set"
                  description="Set roster before match start."
                  action={
                    <Link
                      to="/tournaments/$tournamentId/matches/$matchId/roster"
                      params={{ tournamentId: match.tournamentId, matchId }}
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
              ) : null}
              {hasRosterConfigured && scheduledStep === "toss" ? (
                <MatchCenterTossCard
                  match={match}
                  tossError={vm.tossError}
                  isTossEditable={vm.isTossEditable}
                  isTossSubmitting={vm.isTossSubmitting}
                  onSaveToss={vm.handleSaveToss}
                  onNext={() => setScheduledStep("setup")}
                />
              ) : null}
              {hasRosterConfigured && scheduledStep === "setup" ? (
                <MatchCenterScheduledCard
                  match={match}
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
                onBackToToss={() => setScheduledStep("toss")}
              />
            ) : null}
          </>
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
      {match ? (
        <ResolveTieModal
          isOpen={isTieModalOpen}
          onClose={() => setIsTieModalOpen(false)}
          teams={[
            { id: match.teams.teamA.id, name: match.teams.teamA.name },
            ...(match.teams.teamB
              ? [{ id: match.teams.teamB.id, name: match.teams.teamB.name }]
              : []),
          ]}
          isSubmitting={vm.isResolveTieSubmitting}
          errorMessage={vm.resolveTieError}
          onConfirm={vm.handleResolveTie}
        />
      ) : null}
      {match ? (
        <StartSuperOverModal
          isOpen={isSuperOverModalOpen}
          onClose={() => setIsSuperOverModalOpen(false)}
          teamA={{
            id: match.teams.teamA.id,
            name: match.teams.teamA.name,
            players: vm.teamAPlaying,
          }}
          teamB={{
            id: match.teams.teamB?.id ?? "",
            name: match.teams.teamB?.name ?? "Team B",
            players: vm.teamBPlaying,
          }}
          teamABattingFirst={teamABattingFirstInSuperOver}
          canDetermineBattingOrder={canDetermineSuperOverOrder}
          isSubmitting={vm.isStartSuperOverSubmitting}
          errorMessage={vm.startSuperOverError}
          fieldErrors={vm.startSuperOverFieldErrors}
          onRefreshRoster={vm.refreshRosterData}
          isRefreshingRoster={vm.isRefreshingRoster}
          onSubmit={vm.handleStartSuperOver}
        />
      ) : null}
    </PageStateGate>
  );
};
