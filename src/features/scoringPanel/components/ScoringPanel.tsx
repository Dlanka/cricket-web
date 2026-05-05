import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { Card } from "@/shared/components/card/Card";
import { Button } from "@/components/ui/button/Button";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { useSubmitScoreEventMutation } from "../hooks/useSubmitScoreEventMutation";
import { useMatchRosterQuery } from "../../roster/hooks/useMatchRosterQuery";
import { usePlayersByTeamQuery } from "../../players/hooks/usePlayersByTeamQuery";
import { useChangeCurrentBowlerMutation } from "../../scoring/hooks/useChangeCurrentBowlerMutation";
import { useStartSecondInningsMutation } from "../../scoring/hooks/useStartSecondInningsMutation";
import { useUpdateLiveMatchConfigMutation } from "../../scoring/hooks/useUpdateLiveMatchConfigMutation";
import { useUpdateMatchTimeConfigMutation } from "../../scoring/hooks/useUpdateMatchTimeConfigMutation";
import { useAvailableNextBattersQuery } from "../hooks/useAvailableNextBattersQuery";
import type {
  CorrectBallRequest,
  ExtraType,
  PenaltyRequest,
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
import { MatchSettingsModal } from "./MatchSettingsModal";
import { PenaltyRunsModal } from "./PenaltyRunsModal";

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
  totalMatchMinutes?: number | null;
  splitByInnings?: boolean;
  currentBalls: number;
  inningsCompleted?: boolean;
  isMatchCompleted?: boolean;
  phase?: "REGULAR" | "SUPER_OVER";
  embedded?: boolean;
  showChangeBowlerButton?: boolean;
  onBowlerChangedAtBoundary?: (balls: number) => void;
  selectedBallSeq?: number | null;
  onClearSelectedBall?: () => void;
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
  totalMatchMinutes = null,
  splitByInnings = false,
  currentBalls,
  inningsCompleted = false,
  isMatchCompleted = false,
  phase = "REGULAR",
  embedded = false,
  showChangeBowlerButton = false,
  onBowlerChangedAtBoundary,
  selectedBallSeq = null,
  onClearSelectedBall,
}: Props) => {
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const canWriteScore = can("score.write");
  const canStartSecondInnings = can("match.start");
  const canChangeBowler = can("bowler.change");
  const mutation = useSubmitScoreEventMutation(
    matchId,
    inningsId,
    tournamentId,
  );
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
  const [startSecondInningsModalOpen, setStartSecondInningsModalOpen] =
    useState(false);
  const [startSecondInningsError, setStartSecondInningsError] = useState<
    string | null
  >(null);
  const [undoUnavailableReason, setUndoUnavailableReason] = useState<
    string | null
  >(null);
  const [nextBowlerId, setNextBowlerId] = useState<string>("");
  const [requiresNextBowler, setRequiresNextBowler] = useState(false);
  const [oversCompletedByServer, setOversCompletedByServer] = useState(false);
  const [resolvedOverBoundaryBalls, setResolvedOverBoundaryBalls] = useState<
    number | null
  >(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [penaltyOpen, setPenaltyOpen] = useState(false);
  const [oversInput, setOversInput] = useState(String(totalOvers));
  const [ballsPerOverInput, setBallsPerOverInput] = useState(
    String(totalBallsPerOver),
  );
  const [totalMatchMinutesInput, setTotalMatchMinutesInput] = useState(
    String(totalMatchMinutes ?? 90),
  );
  const [splitByInningsInput, setSplitByInningsInput] =
    useState<boolean>(splitByInnings);
  const [runsWithWicket, setRunsWithWicket] = useState<RunValue>(0);
  const changeBowlerMutation = useChangeCurrentBowlerMutation(
    matchId,
    inningsId,
  );
  const updateConfigMutation = useUpdateLiveMatchConfigMutation(
    matchId,
    inningsId,
  );
  const updateMatchTimeConfigMutation = useUpdateMatchTimeConfigMutation(matchId);

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
    isMatchCompleted ||
    inningsCompleted ||
    showChangeBowlerButton ||
    requiresNextBowler ||
    isOversCompleted ||
    !canWriteScore;
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
    }
  }, [
    currentBalls,
    inningsCompleted,
    totalBallsLimit,
    totalBallsPerOver,
    resolvedOverBoundaryBalls,
  ]);

  useEffect(() => {
    setOversInput(String(totalOvers));
    setBallsPerOverInput(String(totalBallsPerOver));
  }, [totalOvers, totalBallsPerOver]);

  useEffect(() => {
    setTotalMatchMinutesInput(String(totalMatchMinutes ?? 90));
    setSplitByInningsInput(splitByInnings);
  }, [totalMatchMinutes, splitByInnings]);

  const getTeamPlayingIds = (teamId: string) =>
    rosterQuery.data?.teams
      .find((team) => team.teamId === teamId)
      ?.players.filter((player) => player.isPlaying)
      .map((player) => player.playerId) ?? [];

  const currentBowlingPlayingIds = getTeamPlayingIds(bowlingTeamId);
  const currentBattingPlayingIds = getTeamPlayingIds(battingTeamId);

  const bowlingPlayers = (currentBowlingTeamPlayersQuery.data ?? []).filter(
    (player) => currentBowlingPlayingIds.includes(player.id),
  );
  const secondInningsBattingPlayers = (
    currentBowlingTeamPlayersQuery.data ?? []
  )
    .filter((player) => currentBowlingPlayingIds.includes(player.id))
    .map((player) => ({ id: player.id, name: player.fullName }));

  const secondInningsBowlingPlayers = (
    currentBattingTeamPlayersQuery.data ?? []
  )
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
    if (
      !id ||
      currentActiveBatterIds.has(id) ||
      acc.some((option) => option.id === id)
    ) {
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
      | WicketEventRequest
      | PenaltyRequest
      | CorrectBallRequest,
  ) => {
    const isCorrectBall = payload.type === "correctBall";
    const correctionTargetSeq = isCorrectBall ? payload.targetSeq : null;
    const correctionSummary = (() => {
      if (!isCorrectBall) return null;
      const replacement = payload.replacement;
      if (!replacement) return null;
      if (replacement.type === "run") return `${replacement.runs}`;
      if (replacement.type === "extra") {
        const label =
          replacement.extraType === "wide"
            ? "Wd"
            : replacement.extraType === "noBall"
              ? "Nb"
              : replacement.extraType === "byes"
                ? "B"
                : "Lb";
        return `${label}${replacement.additionalRuns ? `+${replacement.additionalRuns}` : ""}`;
      }
      return "W";
    })();
    try {
      const result = await mutation.mutateAsync(payload);
      setUndoUnavailableReason(null);
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
      }
      if (
        isCorrectBall &&
        correctionTargetSeq != null &&
        typeof correctionSummary === "string"
      ) {
        toast.success(
          `Ball #${correctionTargetSeq} corrected to ${correctionSummary}.`,
        );
      }
      resetPanelState();
      return result;
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.code === "score.undo_window_elapsed") {
        const message = "Undo window has expired for this completed match.";
        if (payload.type === "undo") {
          setUndoUnavailableReason(message);
        }
        toast.error(message);
        throw error;
      }
      if (normalized.code === "score.undo_blocked") {
        const message =
          "Undo is blocked because next knockout round has already started.";
        if (payload.type === "undo") {
          setUndoUnavailableReason(message);
        }
        toast.error(message);
        throw error;
      }
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
      if (normalized.code === "score.correction_target_invalid") {
        onClearSelectedBall?.();
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
      return;
    }
    if (wicketSelected) {
      setRunsWithWicket(runs);
      await nextBattersQuery.refetch();
      setWicketModalOpen(true);
      return;
    }
    if (selectedExtraType) {
      if (selectedBallSeq != null) {
        await submitEvent({
          type: "correctBall",
          targetSeq: selectedBallSeq,
          replacement: {
            type: "extra",
            extraType: selectedExtraType,
            additionalRuns: runs,
          },
        });
        onClearSelectedBall?.();
      } else {
        await submitEvent({
          type: "extra",
          extraType: selectedExtraType,
          additionalRuns: runs,
        });
      }
      return;
    }
    if (selectedBallSeq != null) {
      await submitEvent({
        type: "correctBall",
        targetSeq: selectedBallSeq,
        replacement: { type: "run", runs },
      });
      onClearSelectedBall?.();
      return;
    }
    await submitEvent({ type: "run", runs });
  };

  const handleAddPenalty = async (payload: {
    runs: number;
    reason?: string;
  }) => {
    const runs = payload.runs;
    if (!Number.isInteger(runs) || runs === 0) {
      toast.error("Penalty runs must be a non-zero whole number.");
      return;
    }
    await submitEvent({
      type: "penalty",
      runs,
      reason: payload.reason,
    });
    setPenaltyOpen(false);
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
      return;
    }
    await submitEvent({ type: "swap" });
  };

  const handleApplySettings = async () => {
    const overs = Number(oversInput);
    const ballsPerOver = Number(ballsPerOverInput);
    const totalMatchMinutes = Number(totalMatchMinutesInput);
    if (
      !Number.isInteger(overs) ||
      overs < 1 ||
      !Number.isInteger(ballsPerOver) ||
      ballsPerOver < 1 ||
      !Number.isInteger(totalMatchMinutes) ||
      totalMatchMinutes < 1
    ) {
      toast.error(
        "Overs, balls per over, and total match minutes must be positive whole numbers.",
      );
      return;
    }
    const isBallsPerOverLocked = currentBalls > 0;
    try {
      await Promise.all([
        updateConfigMutation.mutateAsync(
          isBallsPerOverLocked
            ? { oversPerInnings: overs }
            : {
                oversPerInnings: overs,
                ballsPerOver,
              },
        ),
        updateMatchTimeConfigMutation.mutateAsync({
          totalMatchMinutes,
          splitByInnings: splitByInningsInput,
        }),
      ]);
      toast.success("Match settings updated.");
      setSettingsOpen(false);
    } catch (error) {
      const normalized = normalizeApiError(error);
      toast.error(normalized.message || "Unable to update match settings.");
    }
  };

  const wicketExtraType: WicketExtraType =
    selectedExtraType === "wide" || selectedExtraType === "noBall"
      ? selectedExtraType
      : "none";

  const content = (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-on-surface-muted">
              Scoring panel
            </p>
            <button
              type="button"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-outline text-on-surface-muted transition hover:border-outline-strong hover:text-on-surface disabled:cursor-not-allowed"
              disabled={
                mutation.isPending || inningsCompleted || isMatchCompleted
              }
              onClick={() => setSettingsOpen(true)}
              aria-label="Open match settings"
              title="Match settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isOversCompleted ? (
          <div className="rounded-lg border border-warning/25 bg-warning-container px-3 py-2 text-xs font-medium text-on-warning-container">
            Innings overs completed.
          </div>
        ) : null}

        {inningsCompleted && !isOversCompleted ? (
          <div className="rounded-lg border border-warning/25 bg-warning-container px-3 py-2 text-xs font-medium text-on-warning-container">
            Innings completed (all out).
          </div>
        ) : null}

        {phase === "SUPER_OVER" ? (
          <div className="rounded-lg border border-primary/30 bg-primary-container px-3 py-2 text-xs font-medium text-on-primary-container">
            Innings ends at 2 wickets.
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-on-surface-muted">
            Extras
          </p>
          <ExtrasSelector
            selectedExtraType={selectedExtraType}
            disabled={mutation.isPending || controlsLocked}
            onToggle={handleExtraToggle}
          />
          <WicketToggle
            checked={wicketSelected}
            disabled={mutation.isPending || controlsLocked}
            onChange={handleWicketChange}
          />
        </div>

        <div className="space-y-2">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-on-surface-muted">
            Runs
          </p>
          <RunButtons
            disabled={mutation.isPending || controlsLocked}
            onRunClick={handleRunClick}
          />
        </div>

        {selectedBallSeq != null ? (
          <div className="rounded-lg border border-primary/35 bg-primary-container/60 px-3 py-2.5 text-xs text-on-primary-container">
            <div className="flex items-center justify-between gap-2">
              <p>
                Editing ball <span className="font-semibold">#{selectedBallSeq}</span>.
                Pick a new run/extra/wicket value.
              </p>
              <Button
                type="button"
                appearance="standard"
                color="neutral"
                size="xs"
                uppercase
                onClick={onClearSelectedBall}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        <ActionButtons
          showCompletedButton={isMatchCompleted}
          undoDisabled={
            mutation.isPending ||
            !canWriteScore ||
            Boolean(undoUnavailableReason)
          }
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
        {inningsCompleted || isOversCompleted ? (
          <div className="">
            <Button
              type="button"
              appearance="outline"
              color="warning"
              size="sm"
              uppercase
              className="w-full justify-center"
              disabled={mutation.isPending || isMatchCompleted}
              onClick={() => setPenaltyOpen(true)}
            >
              Add Penalty Runs
            </Button>
          </div>
        ) : null}
        {undoUnavailableReason ? (
          <p className="text-xs text-on-warning-container">
            {undoUnavailableReason}
          </p>
        ) : null}
      </div>

      <WicketModal
        isOpen={wicketModalOpen}
        isSubmitting={mutation.isPending}
        runsWithWicket={runsWithWicket}
        wicketExtraType={wicketExtraType}
        batterOptions={incomingBatterOptions}
        fielderOptions={bowlingPlayers.map((player) => ({
          id: player.id,
          name: player.fullName,
        }))}
        onClose={() => setWicketModalOpen(false)}
        onSubmit={async (payload) => {
          if (selectedBallSeq != null) {
            await submitEvent({
              type: "correctBall",
              targetSeq: selectedBallSeq,
              replacement: payload,
            });
            onClearSelectedBall?.();
          } else {
            await submitEvent(payload);
          }
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

      <MatchSettingsModal
        isOpen={settingsOpen}
        isSubmitting={
          updateConfigMutation.isPending || updateMatchTimeConfigMutation.isPending
        }
        isBallsPerOverLocked={currentBalls > 0}
        overs={oversInput}
        ballsPerOver={ballsPerOverInput}
        totalMatchMinutes={totalMatchMinutesInput}
        splitByInnings={splitByInningsInput}
        onChangeOvers={setOversInput}
        onChangeBallsPerOver={setBallsPerOverInput}
        onChangeTotalMatchMinutes={setTotalMatchMinutesInput}
        onChangeSplitByInnings={setSplitByInningsInput}
        onClose={() => setSettingsOpen(false)}
        onConfirm={() => {
          void handleApplySettings();
        }}
      />

      <PenaltyRunsModal
        isOpen={penaltyOpen}
        isSubmitting={mutation.isPending}
        onClose={() => setPenaltyOpen(false)}
        onConfirm={(payload) => {
          void handleAddPenalty(payload);
        }}
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
