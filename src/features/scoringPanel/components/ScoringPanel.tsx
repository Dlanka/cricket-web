import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card } from "@/shared/components/card/Card";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { useSubmitScoreEventMutation } from "../hooks/useSubmitScoreEventMutation";
import { useMatchRosterQuery } from "../../roster/hooks/useMatchRosterQuery";
import { usePlayersByTeamQuery } from "../../players/hooks/usePlayersByTeamQuery";
import { useChangeCurrentBowlerMutation } from "../../scoring/hooks/useChangeCurrentBowlerMutation";
import { useStartSecondInningsMutation } from "../../scoring/hooks/useStartSecondInningsMutation";
import { useAvailableNextBattersQuery } from "../hooks/useAvailableNextBattersQuery";
import type {
  ExtraType,
  RetireRequest,
  RunValue,
  WicketEventRequest,
  WicketExtraType,
} from "@/features/scoringPanel/types/scoringPanel.types";
import type { StartSecondInningsRequest } from "../../scoring/types/scoring.types";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { ActionButtons } from "./ActionButtons";
import { ExtrasSelector } from "./ExtrasSelector";
import { RetireModal } from "./RetireModal";
import { RunButtons } from "./RunButtons";
import { WicketModal } from "./WicketModal";
import { WicketToggle } from "./WicketToggle";
import { applyExtraSelection, applyWicketToggle } from "./validation";
import { NextBowlerModal } from "./NextBowlerModal";
import { StartSecondInningsModal } from "./StartSecondInningsModal";

type Props = {
  matchId: string;
  tournamentId?: string;
  inningsId: string;
  battingTeamId: string;
  bowlingTeamId: string;
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  inningsNumber?: number;
  totalBallsPerOver: number;
  totalOvers: number;
  currentBalls: number;
  inningsCompleted?: boolean;
  isMatchCompleted?: boolean;
  embedded?: boolean;
  showChangeBowlerButton?: boolean;
  onBowlerChangedAtBoundary?: (balls: number) => void;
};

export const ScoringPanel = ({
  matchId,
  tournamentId,
  inningsId,
  battingTeamId,
  bowlingTeamId,
  currentStrikerId,
  currentNonStrikerId,
  currentBowlerId,
  inningsNumber,
  totalBallsPerOver,
  totalOvers,
  currentBalls,
  inningsCompleted = false,
  isMatchCompleted = false,
  embedded = false,
  showChangeBowlerButton = false,
  onBowlerChangedAtBoundary,
}: Props) => {
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const canWriteScore = can("score.write");
  const canStartSecondInnings = can("match.start");
  const canChangeBowler = can("bowler.change");
  const mutation = useSubmitScoreEventMutation(matchId, inningsId, tournamentId);
  const rosterQuery = useMatchRosterQuery(matchId);
  const currentBowlingTeamPlayersQuery = usePlayersByTeamQuery(bowlingTeamId);
  const currentBattingTeamPlayersQuery = usePlayersByTeamQuery(battingTeamId);
  const nextBattersQuery = useAvailableNextBattersQuery(matchId);
  const startSecondInningsMutation = useStartSecondInningsMutation(matchId);
  const [selectedExtraType, setSelectedExtraType] = useState<ExtraType | null>(
    null,
  );
  const [wicketSelected, setWicketSelected] = useState(false);
  const [wicketModalOpen, setWicketModalOpen] = useState(false);
  const [retireModalOpen, setRetireModalOpen] = useState(false);
  const [nextBowlerModalOpen, setNextBowlerModalOpen] = useState(false);
  const [startSecondInningsModalOpen, setStartSecondInningsModalOpen] = useState(false);
  const [startSecondInningsError, setStartSecondInningsError] = useState<string | null>(null);
  const [nextBowlerId, setNextBowlerId] = useState<string>("");
  const [requiresNextBowler, setRequiresNextBowler] = useState(false);
  const [oversCompletedByServer, setOversCompletedByServer] = useState(false);
  const [resolvedOverBoundaryBalls, setResolvedOverBoundaryBalls] = useState<
    number | null
  >(null);
  const [runsWithWicket, setRunsWithWicket] = useState<RunValue>(0);
  const changeBowlerMutation = useChangeCurrentBowlerMutation(
    matchId,
    inningsId,
  );

  const getChangeBowlerErrorMessage = (code?: string, fallback?: string) => {
    switch (code) {
      case "match.over_not_finished":
        return "You can change bowler only after over completes.";
      case "match.overs_completed":
        return "Innings overs completed. Bowler cannot be changed.";
      case "match.bowler_invalid":
        return "Selected player is not in bowling XI.";
      case "match.invalid_state":
        return "Match is not live.";
      default:
        return fallback || "Unable to change bowler.";
    }
  };

  const resetPanelState = () => {
    setSelectedExtraType(null);
    setWicketSelected(false);
  };

  const totalBallsLimit = totalOvers * totalBallsPerOver;
  const isBallsExhausted = currentBalls >= totalBallsLimit;
  const isOversCompleted = isBallsExhausted || oversCompletedByServer;
  const controlsLocked =
    isMatchCompleted || inningsCompleted || requiresNextBowler || isOversCompleted || !canWriteScore;
  const canScoreBall = !controlsLocked;
  const shouldShowChangeBowlerButton =
    showChangeBowlerButton || requiresNextBowler || nextBowlerModalOpen;
  const showStartSecondInningsButton = Boolean(
    inningsNumber === 1 && (isOversCompleted || inningsCompleted),
  );

  useEffect(() => {
    const completedOverBoundary =
      !inningsCompleted &&
      currentBalls > 0 &&
      currentBalls < totalBallsLimit &&
      currentBalls % totalBallsPerOver === 0;
    if (completedOverBoundary && resolvedOverBoundaryBalls !== currentBalls) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRequiresNextBowler(true);
      setNextBowlerModalOpen(true);
    }
  }, [
    currentBalls,
    inningsCompleted,
    totalBallsLimit,
    totalBallsPerOver,
    resolvedOverBoundaryBalls,
  ]);

  const getTeamPlayingIds = (teamId: string) =>
    rosterQuery.data?.teams
      .find((team) => team.teamId === teamId)
      ?.players.filter((player) => player.isPlaying)
      .map((player) => player.playerId) ?? [];

  const currentBowlingPlayingIds = getTeamPlayingIds(bowlingTeamId);
  const currentBattingPlayingIds = getTeamPlayingIds(battingTeamId);

  const bowlingPlayers = (currentBowlingTeamPlayersQuery.data ?? []).filter((player) =>
    currentBowlingPlayingIds.includes(player.id),
  );

  const secondInningsBattingPlayers = (currentBowlingTeamPlayersQuery.data ?? [])
    .filter((player) => currentBowlingPlayingIds.includes(player.id))
    .map((player) => ({ id: player.id, name: player.fullName }));

  const secondInningsBowlingPlayers = (currentBattingTeamPlayersQuery.data ?? [])
    .filter((player) => currentBattingPlayingIds.includes(player.id))
    .map((player) => ({ id: player.id, name: player.fullName }));
  const normalizeId = (value: string) => value.trim();
  const currentActiveBatterIds = new Set(
    [
      normalizeId(currentStrikerId),
      normalizeId(currentNonStrikerId),
      nextBattersQuery.data?.strikerId,
      nextBattersQuery.data?.nonStrikerId,
    ]
      .map((value) => (value ?? "").trim())
      .filter(Boolean),
  );
  const incomingBatterOptions = (nextBattersQuery.data?.items ?? []).reduce<
    { id: string; name: string }[]
  >((acc, player) => {
    const id = normalizeId(player.playerId);
    if (!id || currentActiveBatterIds.has(id) || acc.some((option) => option.id === id)) {
      return acc;
    }
    acc.push({ id, name: player.fullName });
    return acc;
  }, []);

  const handleStartSecondInnings = async (
    payload: StartSecondInningsRequest,
  ) => {
    setStartSecondInningsError(null);
    try {
      await startSecondInningsMutation.mutateAsync(payload);
      toast.success("Second innings started.");
      setStartSecondInningsModalOpen(false);
    } catch (error) {
      const normalized = normalizeApiError(error);
      setStartSecondInningsError(
        normalized.message || "Unable to start second innings.",
      );
    }
  };

  const submitEvent = async (
    payload:
      | { type: "run"; runs: RunValue }
      | { type: "extra"; extraType: ExtraType; additionalRuns: number }
      | { type: "swap" }
      | { type: "undo" }
      | RetireRequest
      | WicketEventRequest,
  ) => {
    try {
      const result = await mutation.mutateAsync(payload);
      setOversCompletedByServer(false);
      const nextBalls = result.score?.balls;
      if (payload.type === "undo") {
        // Undo returns backend-restored snapshot; clear any local over-break lock.
        setRequiresNextBowler(false);
        setNextBowlerModalOpen(false);
        setNextBowlerId("");
        setResolvedOverBoundaryBalls(null);
        setOversCompletedByServer(false);
      } else if (
        typeof nextBalls === "number" &&
        nextBalls > 0 &&
        nextBalls < totalBallsLimit &&
        nextBalls % totalBallsPerOver === 0
      ) {
        setRequiresNextBowler(true);
        setNextBowlerModalOpen(true);
      }
      resetPanelState();
      return result;
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (
        normalized.code === "match.invalid_state" ||
        normalized.code === "match.already_completed" ||
        normalized.message.toLowerCase().includes("already completed")
      ) {
        toast.message("Match already completed");
        return undefined;
      }
      if (normalized.code === "match.overs_completed") {
        setOversCompletedByServer(true);
      }
      toast.error(normalized.message || "Unable to submit event.");
      throw error;
    }
  };

  const handleRunClick = async (runs: RunValue) => {
    if (mutation.isPending) {
      return;
    }
    if (!canScoreBall) {
      if (requiresNextBowler) {
        setNextBowlerModalOpen(true);
      }
      return;
    }
    if (wicketSelected) {
      setRunsWithWicket(runs);
      await nextBattersQuery.refetch();
      setWicketModalOpen(true);
      return;
    }
    if (selectedExtraType) {
      await submitEvent({
        type: "extra",
        extraType: selectedExtraType,
        additionalRuns: runs,
      });
      return;
    }
    await submitEvent({ type: "run", runs });
  };

  const handleExtraToggle = (extraType: ExtraType) => {
    setSelectedExtraType((previousExtraType) => {
      const next = applyExtraSelection(
        previousExtraType,
        extraType,
        wicketSelected,
      );
      setWicketSelected(next.wicketSelected);
      return next.selectedExtraType;
    });
  };

  const handleWicketChange = (checked: boolean) => {
    setWicketSelected(checked);
    setSelectedExtraType((previousExtraType) => {
      const next = applyWicketToggle(checked, previousExtraType);
      return next.selectedExtraType;
    });
  };

  const handleUndo = async () => {
    await submitEvent({ type: "undo" });
  };

  const handleSwap = async () => {
    if (!canScoreBall) {
      if (requiresNextBowler) {
        setNextBowlerModalOpen(true);
      }
      return;
    }
    await submitEvent({ type: "swap" });
  };

  const wicketExtraType: WicketExtraType =
    selectedExtraType === "wide" || selectedExtraType === "noBall"
      ? selectedExtraType
      : "none";

  const content = (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
            Scoring panel
          </p>
        </div>

        {isOversCompleted ? (
          <div className="rounded-lg border border-warning-80 bg-warning-95 px-3 py-2 text-xs font-medium text-warning-30">
            Innings overs completed.
          </div>
        ) : null}

        {inningsCompleted && !isOversCompleted ? (
          <div className="rounded-lg border border-warning-80 bg-warning-95 px-3 py-2 text-xs font-medium text-warning-30">
            Innings completed (all out).
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-40">
              Extras
            </p>
            <ExtrasSelector
              selectedExtraType={selectedExtraType}
              disabled={mutation.isPending || controlsLocked}
              onToggle={handleExtraToggle}
            />
          </div>
          <div className="mt-6">
            <WicketToggle
              checked={wicketSelected}
              disabled={mutation.isPending || controlsLocked}
              onChange={handleWicketChange}
            />
          </div>
        </div>

        <RunButtons
          disabled={
            mutation.isPending || controlsLocked
          }
          onRunClick={handleRunClick}
        />

        <ActionButtons
          showCompletedButton={isMatchCompleted}
          undoDisabled={mutation.isPending || isMatchCompleted || !canWriteScore}
          disabled={mutation.isPending || controlsLocked || !canWriteScore}
          showStartSecondInningsButton={showStartSecondInningsButton}
          startSecondInningsDisabled={
            mutation.isPending ||
            startSecondInningsMutation.isPending ||
            !canStartSecondInnings
          }
          showChangeBowlerButton={shouldShowChangeBowlerButton}
          changeBowlerDisabled={
            mutation.isPending ||
            changeBowlerMutation.isPending ||
            inningsCompleted ||
            isOversCompleted ||
            !canChangeBowler
          }
          onUndo={handleUndo}
          onSwap={handleSwap}
          onRetire={() => {
            void nextBattersQuery.refetch().finally(() => {
              setRetireModalOpen(true);
            });
          }}
          onStartSecondInnings={() => {
            setStartSecondInningsError(null);
            setStartSecondInningsModalOpen(true);
          }}
          onChangeBowler={() => {
            setNextBowlerModalOpen(true);
            setRequiresNextBowler(true);
          }}
          onCompleted={() => {
            if (tournamentId) {
              navigate({
                to: "/tournaments/$tournamentId/fixtures",
                params: { tournamentId },
              });
              return;
            }
            window.history.back();
          }}
        />
      </div>

      <WicketModal
        isOpen={wicketModalOpen}
        isSubmitting={mutation.isPending}
        runsWithWicket={runsWithWicket}
        wicketExtraType={wicketExtraType}
        batterOptions={incomingBatterOptions}
        onClose={() => setWicketModalOpen(false)}
        onSubmit={async (payload) => {
          await submitEvent(payload);
          setWicketModalOpen(false);
        }}
      />

      <RetireModal
        isOpen={retireModalOpen}
        isSubmitting={mutation.isPending}
        batterOptions={incomingBatterOptions}
        onClose={() => setRetireModalOpen(false)}
        onSubmit={async (payload) => {
          await submitEvent(payload);
          setRetireModalOpen(false);
        }}
      />

      <NextBowlerModal
        isOpen={nextBowlerModalOpen}
        isSubmitting={mutation.isPending || changeBowlerMutation.isPending}
        players={bowlingPlayers}
        currentBowlerId={currentBowlerId}
        selectedBowlerId={nextBowlerId}
        onSelectBowler={setNextBowlerId}
        onClose={() => setNextBowlerModalOpen(false)}
        onConfirm={() => {
          if (!nextBowlerId) {
            return;
          }
          void changeBowlerMutation
            .mutateAsync(nextBowlerId)
            .then(() => {
              setResolvedOverBoundaryBalls(currentBalls);
              setRequiresNextBowler(false);
              setNextBowlerModalOpen(false);
              setNextBowlerId("");
              onBowlerChangedAtBoundary?.(currentBalls);
            })
            .catch((error) => {
              const normalized = normalizeApiError(error);
              if (normalized.code === "match.overs_completed") {
                setOversCompletedByServer(true);
              }
              toast.error(
                getChangeBowlerErrorMessage(
                  normalized.code,
                  normalized.message,
                ),
              );
            });
        }}
      />

      <StartSecondInningsModal
        isOpen={startSecondInningsModalOpen}
        isSubmitting={startSecondInningsMutation.isPending}
        canStart={canStartSecondInnings}
        battingPlayers={secondInningsBattingPlayers}
        bowlingPlayers={secondInningsBowlingPlayers}
        errorMessage={startSecondInningsError}
        onClose={() => setStartSecondInningsModalOpen(false)}
        onSubmit={handleStartSecondInnings}
      />
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-lg">
      {content}
    </Card>
  );
};
