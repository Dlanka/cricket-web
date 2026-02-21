import { useEffect, useMemo, useState } from "react";
import type { Player } from "@/features/players/types/players.types";
import type { RosterTeamEntry, SetRosterRequest } from "../../types/roster.types";
import { PlayerPickList } from "./PlayerPickList";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import { setRosterSchema } from "../../schemas/roster.schemas";
import {
  applyRosterToggle,
  getSelectionError,
  mapRosterErrorMessage,
  MAX_ROSTER_PLAYERS,
  uniqueIds,
} from "@/features/roster/utils/rosterForm";

type Props = {
  teamId: string;
  teamName: string;
  showTeamHeader?: boolean;
  rosterTeam?: RosterTeamEntry;
  players: Player[];
  isLoading: boolean;
  canEdit: boolean;
  isSaving: boolean;
  onSave: (payload: SetRosterRequest) => Promise<void>;
  onStatusChange?: (
    teamId: string,
    status: "saved" | "unsaved" | "incomplete",
  ) => void;
};

const buildRosterState = (rosterTeam?: RosterTeamEntry) => {
  const playingIds = uniqueIds(
    rosterTeam?.players
      .filter((player) => player.isPlaying)
      .map((p) => p.playerId) ?? [],
  );
  const captain = rosterTeam?.players.find((player) => player.isCaptain)?.playerId;
  const keeper = rosterTeam?.players.find((player) => player.isKeeper)?.playerId;
  return {
    playingIds,
    captainId: captain,
    keeperId: keeper,
  };
};

export const RosterTeamPanel = ({
  teamId,
  teamName,
  showTeamHeader = true,
  rosterTeam,
  players,
  isLoading,
  canEdit,
  isSaving,
  onSave,
  onStatusChange,
}: Props) => {
  const initial = useMemo(() => buildRosterState(rosterTeam), [rosterTeam]);
  const [playingIds, setPlayingIds] = useState<string[]>(initial.playingIds);
  const [captainId, setCaptainId] = useState<string | undefined>(initial.captainId);
  const [keeperId, setKeeperId] = useState<string | undefined>(initial.keeperId);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectionServerError, setSelectionServerError] = useState<string | null>(null);
  const [captainServerError, setCaptainServerError] = useState<string | null>(null);
  const [keeperServerError, setKeeperServerError] = useState<string | null>(null);

  const togglePlayer = (playerId: string) => {
    if (!canEdit) {
      return;
    }
    const next = applyRosterToggle({ playingIds, captainId, keeperId }, playerId);
    setPlayingIds(next.playingIds);
    setCaptainId(next.captainId);
    setKeeperId(next.keeperId);
    setSelectionServerError(null);
    setCaptainServerError(null);
    setKeeperServerError(null);
  };
  const maxSelectablePlayers = Math.min(MAX_ROSTER_PLAYERS, players.length);
  const selectAllPlayerIds = players
    .slice(0, maxSelectablePlayers)
    .map((player) => player.id);
  const isSelectAllChecked =
    selectAllPlayerIds.length > 0 &&
    selectAllPlayerIds.every((playerId) => playingIds.includes(playerId));
  const handleSelectAll = (checked: boolean) => {
    if (!canEdit) {
      return;
    }
    if (!checked) {
      setPlayingIds([]);
      setCaptainId(undefined);
      setKeeperId(undefined);
      setSelectionServerError(null);
      setCaptainServerError(null);
      setKeeperServerError(null);
      return;
    }

    setPlayingIds(selectAllPlayerIds);
    setCaptainId((prev) =>
      prev && selectAllPlayerIds.includes(prev) ? prev : undefined,
    );
    setKeeperId((prev) =>
      prev && selectAllPlayerIds.includes(prev) ? prev : undefined,
    );
    setSelectionServerError(null);
    setCaptainServerError(null);
    setKeeperServerError(null);
  };

  const selectionError = getSelectionError(playingIds.length);
  const captainError =
    captainId && !playingIds.includes(captainId)
      ? "Captain must be in selected playing players."
      : null;
  const keeperError =
    keeperId && !playingIds.includes(keeperId)
      ? "Keeper must be in selected playing players."
      : null;

  const normalizeIds = (ids: string[]) => [...ids].sort();
  const isDirty =
    JSON.stringify(normalizeIds(playingIds)) !==
      JSON.stringify(normalizeIds(initial.playingIds)) ||
    (captainId ?? "") !== (initial.captainId ?? "") ||
    (keeperId ?? "") !== (initial.keeperId ?? "");
  const isIncomplete = Boolean(selectionError || captainError || keeperError);
  const tabStatus: "saved" | "unsaved" | "incomplete" = isIncomplete
    ? "incomplete"
    : isDirty
      ? "unsaved"
      : "saved";

  useEffect(() => {
    onStatusChange?.(teamId, tabStatus);
  }, [onStatusChange, teamId, tabStatus]);

  const handleSave = async () => {
    const uniquePlayingIds = uniqueIds(playingIds);
    const payload: SetRosterRequest = {
      teamId,
      playingPlayerIds: uniquePlayingIds,
      captainId,
      keeperId,
    };
    try {
      setRosterSchema.parse(payload);
      setFormError(null);
      setSelectionServerError(null);
      setCaptainServerError(null);
      setKeeperServerError(null);
      await onSave(payload);
    } catch (err) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "details" in err &&
        typeof (err as { details?: unknown }).details === "object" &&
        (err as { details?: { error?: { code?: string } } }).details?.error?.code
          ? (err as { details?: { error?: { code?: string } } }).details?.error
              ?.code
          : undefined;
      const message = mapRosterErrorMessage(err, "Check roster selection.");
      if (code === "match.roster_size_invalid" || code === "match.roster_invalid") {
        setSelectionServerError(message);
      } else if (code === "match.captain_invalid") {
        setCaptainServerError(message);
      } else if (code === "match.keeper_invalid") {
        setKeeperServerError(message);
      } else {
        setFormError(message);
      }
    }
  };

  const availableCaptains = players.filter((player) =>
    playingIds.includes(player.id),
  );
  const captainOptions = [
    { value: "", label: "Select captain" },
    ...availableCaptains.map((player) => ({
      value: player.id,
      label: player.fullName,
    })),
  ];
  const keeperOptions = [
    { value: "", label: "Select keeper" },
    ...availableCaptains.map((player) => ({
      value: player.id,
      label: player.fullName,
    })),
  ];

  return (
    <section className="rounded-3xl border border-neutral-90 bg-neutral-99 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-4">
        {showTeamHeader ? (
          <div>
            <h2 className="text-lg font-semibold text-primary-10">{teamName}</h2>
            <p className="text-xs text-neutral-40">Select playing XI</p>
          </div>
        ) : (
          <p className="text-xs text-neutral-40">Select playing XI</p>
        )}
      </div>

      {selectionServerError ? (
        <div className="mt-4 rounded-2xl border border-error-80 bg-error-95 px-4 py-2 text-xs text-error-40">
          {selectionServerError}
        </div>
      ) : null}
      {formError ? (
        <div className="mt-4 rounded-2xl border border-error-80 bg-error-95 px-4 py-2 text-xs text-error-40">
          {formError}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-neutral-90 bg-neutral-99 p-4 text-sm text-neutral-40">
          Loading players...
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <label className="inline-flex items-center gap-2 text-sm text-primary-10">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary-40"
              checked={isSelectAllChecked}
              onChange={(event) => handleSelectAll(event.target.checked)}
              disabled={!canEdit || players.length === 0}
            />
            <span>Select all (max {MAX_ROSTER_PLAYERS})</span>
          </label>
          <PlayerPickList
            players={players}
            selectedIds={playingIds}
            captainId={captainId}
            keeperId={keeperId}
            onToggle={togglePlayer}
            canEdit={canEdit}
          />
          {selectionError ? (
            <div className="rounded-2xl border border-error-80 bg-error-95 px-4 py-2 text-xs text-error-40">
              {selectionError}
            </div>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <FormGroup
              label="Captain"
              error={captainError ?? captainServerError ?? undefined}
            >
              <SelectField
                options={captainOptions}
                value={captainId ?? ""}
                onChange={(event) => {
                  setCaptainId(event.target.value || undefined);
                  setCaptainServerError(null);
                }}
                disabled={!canEdit}
              />
            </FormGroup>
            <FormGroup
              label="Keeper"
              error={keeperError ?? keeperServerError ?? undefined}
            >
              <SelectField
                options={keeperOptions}
                value={keeperId ?? ""}
                onChange={(event) => {
                  setKeeperId(event.target.value || undefined);
                  setKeeperServerError(null);
                }}
                disabled={!canEdit}
              />
            </FormGroup>
          </div>
          {canEdit ? (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-neutral-40">
                {playingIds.length}/{MAX_ROSTER_PLAYERS} selected
              </p>
              <Button
                type="button"
                appearance="filled"
                color="primary"
                size="sm"
                disabled={
                  isSaving ||
                  !canEdit ||
                  !!selectionError ||
                  !!captainError ||
                  !!keeperError
                }
                onClick={handleSave}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
};
