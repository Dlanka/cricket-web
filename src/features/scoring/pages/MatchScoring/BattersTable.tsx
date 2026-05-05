import { useMemo, useState } from "react";
import { Card } from "@/shared/components/card/Card";
import { Table, type TableColumn } from "@/shared/components/table/Table";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import { CenterModal } from "@/shared/components/modals/CenterModal";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { toast } from "sonner";
import { useChangeCurrentBattersMutation } from "../../hooks/useChangeCurrentBattersMutation";
import { useMatchRosterQuery } from "@/features/roster/hooks/useMatchRosterQuery";
import { usePlayersByTeamQuery } from "@/features/players/hooks/usePlayersByTeamQuery";
import { classNames } from "@/shared/utils/classNames";
import { useInningsBattersQuery } from "../../hooks/useInningsBattersQuery";
import type { BatterRow } from "../../types/scoring.types";

type Props = {
  matchId: string;
  battingTeamId: string;
  inningsId: string;
  strikerId?: string;
  nonStrikerId?: string;
  playerNameById?: Record<string, string>;
  totalRuns?: number;
  extrasBreakdown?: {
    extras?: number;
    wides?: number;
    noBalls?: number;
    byes?: number;
    legByes?: number;
  };
};

export const BattersTable = ({
  matchId,
  battingTeamId,
  inningsId,
  strikerId,
  nonStrikerId,
  playerNameById,
  totalRuns,
  extrasBreakdown,
}: Props) => {
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<"striker" | "nonStriker" | null>(
    null,
  );
  const [replacementBatterId, setReplacementBatterId] = useState("");
  const changeBattersMutation = useChangeCurrentBattersMutation(matchId, inningsId);
  const rosterQuery = useMatchRosterQuery(matchId);
  const battingPlayersQuery = usePlayersByTeamQuery(battingTeamId);
  const { data, isLoading, isError, error } = useInningsBattersQuery(inningsId);
  const normalizedStrikerId = strikerId ? String(strikerId).trim() : "";
  const normalizedNonStrikerId = nonStrikerId
    ? String(nonStrikerId).trim()
    : "";
  const playingXiOptions = useMemo(() => {
    const battingTeam = rosterQuery.data?.teams.find(
      (team) => team.teamId === battingTeamId,
    );
    const playingIds = new Set(
      (battingTeam?.players ?? [])
        .filter((player) => player.isPlaying)
        .map((player) => player.playerId),
    );
    const rosterPlayers = (battingPlayersQuery.data ?? [])
      .filter((player) => playingIds.has(player.id))
      .map((player) => ({ value: player.id, label: player.fullName }));
    if (rosterPlayers.length > 0) {
      return rosterPlayers;
    }
    return (data?.items ?? [])
      .filter((row) => !row.isOut)
      .map((row) => ({ value: row.batterId, label: row.name }));
  }, [battingTeamId, battingPlayersQuery.data, data?.items, rosterQuery.data?.teams]);

  const replacementOptions = useMemo(() => {
    const currentOtherBatterId =
      targetRole === "striker" ? normalizedNonStrikerId : normalizedStrikerId;
    return playingXiOptions.filter(
      (option) => option.value !== currentOtherBatterId,
    );
  }, [normalizedNonStrikerId, normalizedStrikerId, playingXiOptions, targetRole]);
  const playingXiIdSet = useMemo(
    () => new Set(playingXiOptions.map((option) => option.value)),
    [playingXiOptions],
  );
  const batterDocToPlayerId = useMemo(
    () =>
      new Map(
        (data?.items ?? [])
          .filter((row) => row.playerId && row.batterId)
          .map((row) => [String(row.batterId).trim(), String(row.playerId).trim()]),
      ),
    [data?.items],
  );
  const resolveOnFieldPlayerId = (rawId: string) => {
    if (!rawId) return "";
    if (playingXiIdSet.has(rawId)) return rawId;
    return batterDocToPlayerId.get(rawId) ?? rawId;
  };
  const effectiveStrikerPlayerId = resolveOnFieldPlayerId(normalizedStrikerId);
  const effectiveNonStrikerPlayerId = resolveOnFieldPlayerId(normalizedNonStrikerId);

  const openReplaceModal = (role: "striker" | "nonStriker", batterId: string) => {
    setTargetRole(role);
    setReplacementBatterId(batterId);
    setReplaceModalOpen(true);
  };

  const handleApplyReplacement = async () => {
    if (!targetRole) {
      return;
    }
    let nextStrikerId =
      targetRole === "striker" ? replacementBatterId : effectiveStrikerPlayerId;
    let nextNonStrikerId =
      targetRole === "nonStriker" ? replacementBatterId : effectiveNonStrikerPlayerId;
    if (!nextStrikerId || !nextNonStrikerId) {
      toast.error("Select batter.");
      return;
    }
    if (!playingXiIdSet.has(replacementBatterId)) {
      toast.error("Selected batter is not in batting Playing XI.");
      return;
    }
    if (!playingXiIdSet.has(nextStrikerId)) {
      const fallback = replacementOptions.find(
        (option) => option.value !== nextNonStrikerId,
      )?.value;
      if (!fallback) {
        toast.error("No valid striker available in batting Playing XI.");
        return;
      }
      nextStrikerId = fallback;
    }
    if (!playingXiIdSet.has(nextNonStrikerId)) {
      const fallback = replacementOptions.find(
        (option) => option.value !== nextStrikerId,
      )?.value;
      if (!fallback) {
        toast.error("No valid non-striker available in batting Playing XI.");
        return;
      }
      nextNonStrikerId = fallback;
    }
    if (nextStrikerId === nextNonStrikerId) {
      toast.error("Striker and non-striker must be different.");
      return;
    }
    try {
      await changeBattersMutation.mutateAsync({
        strikerId: nextStrikerId,
        nonStrikerId: nextNonStrikerId,
        transferStats: true,
      });
      toast.success("Current batter updated.");
      setReplaceModalOpen(false);
      setTargetRole(null);
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || "Unable to update current batter.");
    }
  };
  const batterRuns = (data?.items ?? []).reduce(
    (sum, row) => sum + row.runs,
    0,
  );
  const resolvedTotalRuns = totalRuns ?? batterRuns;
  const extrasTotal =
    extrasBreakdown?.extras ?? Math.max(0, resolvedTotalRuns - batterRuns);
  const wides = extrasBreakdown?.wides;
  const noBalls = extrasBreakdown?.noBalls;
  const byes = extrasBreakdown?.byes;
  const legByes = extrasBreakdown?.legByes;
  const extrasParts = [
    { label: "WD", value: wides ?? 0 },
    { label: "NB", value: noBalls ?? 0 },
    { label: "B", value: byes ?? 0 },
    { label: "LB", value: legByes ?? 0 },
  ].filter((part) => part.value > 0);
  const classifiedExtras = extrasParts.reduce(
    (sum, part) => sum + part.value,
    0,
  );
  const remainingExtras = Math.max(0, extrasTotal - classifiedExtras);
  if (remainingExtras > 0) {
    extrasParts.push({ label: "OTHER", value: remainingExtras });
  }
  const extrasDetails = extrasParts.length
    ? ` (${extrasParts.map((part) => `${part.value} ${part.label}`).join(", ")})`
    : "";
  const openingBatters = Array.from(
    new Set([normalizedStrikerId, normalizedNonStrikerId].filter(Boolean)),
  ).map((id) => ({
    id,
    name: playerNameById?.[id] ?? id,
    isStriker: id === normalizedStrikerId,
  }));
  const formatOutKind = (outKind?: string | null) => {
    if (!outKind) return "Out";
    if (
      outKind === "runOut" ||
      outKind === "runOutStriker" ||
      outKind === "runOutNonStriker"
    ) {
      return "run out";
    }
    return outKind;
  };
  const tableHeaderClassName =
    "pb-3 pt-3 font-display text-xs font-bold tracking-widest uppercase text-on-surface-subtle";
  const sortedRows = useMemo(() => {
    const rows = [...(data?.items ?? [])];
    const getRank = (row: BatterRow) => {
      const rowPlayerId = row.playerId ? String(row.playerId).trim() : "";
      const rowBatterId = row.batterId ? String(row.batterId).trim() : "";
      const isStriker =
        rowBatterId === normalizedStrikerId ||
        rowPlayerId === normalizedStrikerId ||
        rowPlayerId === effectiveStrikerPlayerId;
      const isNonStriker =
        rowBatterId === normalizedNonStrikerId ||
        rowPlayerId === normalizedNonStrikerId ||
        rowPlayerId === effectiveNonStrikerPlayerId;
      if (isStriker) return 0;
      if (isNonStriker) return 1;
      return 2;
    };
    return rows.sort((a, b) => getRank(a) - getRank(b));
  }, [
    data?.items,
    effectiveNonStrikerPlayerId,
    effectiveStrikerPlayerId,
    normalizedNonStrikerId,
    normalizedStrikerId,
  ]);
  const initialRows: BatterRow[] = useMemo(
    () =>
      openingBatters.map((batter) => ({
        batterId: batter.id,
        playerId: batter.id,
        name: batter.name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        outKind: null,
        dismissalText: null,
        sr: 0,
      })),
    [openingBatters],
  );
  const displayRows = sortedRows.length > 0 ? sortedRows : initialRows;
  const columns: TableColumn<BatterRow>[] = [
    {
      key: "batter",
      header: "Batters",
      className: "w-col-batter px-5",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-semibold text-on-surface",
      render: (row) => {
        const rowPlayerId = row.playerId ? String(row.playerId).trim() : "";
        const rowBatterId = row.batterId ? String(row.batterId).trim() : "";
        const isStriker =
          !row.isOut &&
          (rowBatterId === normalizedStrikerId ||
            rowPlayerId === normalizedStrikerId ||
            rowPlayerId === effectiveStrikerPlayerId);
        const isNonStriker =
          !row.isOut &&
          (rowBatterId === normalizedNonStrikerId ||
            rowPlayerId === normalizedNonStrikerId ||
            rowPlayerId === effectiveNonStrikerPlayerId);
        const isNotOut = !row.isOut;
        const isClickable = isStriker || isNonStriker;
        return (
          <>
            <span className="inline-flex items-center gap-2">
              {isClickable ? (
                <button
                  type="button"
                  className={classNames(
                    "cursor-pointer rounded px-0 text-left transition hover:text-on-primary-container",
                    isNotOut
                      ? "font-semibold text-on-surface"
                      : "font-medium text-on-surface-muted",
                  )}
                  onClick={() =>
                    openReplaceModal(
                      isStriker ? "striker" : "nonStriker",
                      rowPlayerId || rowBatterId,
                    )
                  }
                >
                  {row.name}
                </button>
              ) : (
                <span
                  className={classNames(
                    isNotOut
                      ? "font-semibold text-on-surface"
                      : "font-medium text-on-surface-muted",
                  )}
                >
                  {row.name}
                </span>
              )}

              {isStriker ? (
                <span className="flex size-1.5 rounded-full bg-success"></span>
              ) : null}
            </span>
            {row.isOut ? (
              <span className="ml-2 text-xs text-on-surface-subtle">
                {row.dismissalText ?? formatOutKind(row.outKind)}
              </span>
            ) : null}
          </>
        );
      },
    },
    {
      key: "runs",
      header: "R",
      align: "right",
      className: "w-col-stat px-3",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => row.runs,
    },
    {
      key: "balls",
      header: "B",
      align: "right",
      className: "w-col-stat px-3",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => row.balls,
    },
    {
      key: "fours",
      header: "4s",
      align: "right",
      className: "w-col-stat px-3",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => row.fours,
    },
    {
      key: "sixes",
      header: "6s",
      align: "right",
      className: "w-col-stat px-3",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => row.sixes,
    },
    {
      key: "sr",
      header: "SR",
      align: "right",
      className: "w-col-sr px-5",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => (
        <span
          className={
            !row.isOut && row.batterId === normalizedStrikerId
              ? "text-on-primary-container"
              : row.isOut
                ? "text-on-surface-subtle"
                : "text-on-surface-variant"
          }
        >
          {row.sr}
        </span>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden border-outline bg-surface-container p-0!">
      {isLoading ? (
        <p className="px-5 py-3 text-sm text-on-surface-variant">
          Loading batters...
        </p>
      ) : null}
      {isError ? (
        <p className="px-5 py-3 text-sm text-on-error-container">
          {error instanceof Error ? error.message : "Unable to load batters."}
        </p>
      ) : null}
      {displayRows.length ? (
        <Table
          columns={columns}
          rows={displayRows}
          rowKey={(row) => row.batterId}
          wrapperClassName="md:overflow-visible"
          tableClassName="min-w-table-batter md:min-w-0"
          rowClassName={(row) => {
            const rowPlayerId = row.playerId ? String(row.playerId).trim() : "";
            const rowBatterId = row.batterId ? String(row.batterId).trim() : "";
            const isActiveStriker =
              rowBatterId === normalizedStrikerId ||
              rowPlayerId === normalizedStrikerId ||
              rowPlayerId === effectiveStrikerPlayerId;
            return isActiveStriker
              ? "border-outline-variant bg-surface-container-high text-on-surface"
              : !row.isOut
                ? "border-outline-variant text-on-surface-muted"
                : "border-outline-variant text-on-surface-muted/70";
          }}
        />
      ) : !isLoading && !isError ? (
        <p className="px-5 py-3 text-sm text-on-surface-variant">
          No batters yet.
        </p>
      ) : null}
      {!isLoading && !isError ? (
        <div className="text-xs text-on-surface-variant">
          <div className="border-t border-outline-variant bg-surface-container-high/50 px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-medium text-sm tracking-wider text-on-surface-muted">
                Extras
              </span>
              <span className="text-right font-semibold font-display text-base text-on-surface-variant">
                <span>{extrasTotal}</span>
                <span className="text-on-surface-muted">{extrasDetails}</span>
              </span>
            </div>
          </div>

          <div className="border-t border-outline-variant bg-surface-container-high/50 px-5 py-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-medium text-sm tracking-wider text-on-surface-muted">
                Total runs
              </span>
              <span className="text-right font-display text-lg font-bold text-success">
                {resolvedTotalRuns}
              </span>
            </div>
          </div>
        </div>
      ) : null}
      <CenterModal
        isOpen={replaceModalOpen}
        onClose={
          changeBattersMutation.isPending
            ? () => undefined
            : () => {
                setReplaceModalOpen(false);
                setTargetRole(null);
              }
        }
        title={
          targetRole === "striker"
            ? "Change striker"
            : targetRole === "nonStriker"
              ? "Change non-striker"
              : "Change batter"
        }
        description="Select replacement batter."
        closeOnOverlayClick={!changeBattersMutation.isPending}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              appearance="outline"
              color="neutral"
              size="sm"
              disabled={changeBattersMutation.isPending}
              onClick={() => {
                setReplaceModalOpen(false);
                setTargetRole(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={
                changeBattersMutation.isPending ||
                !replacementBatterId ||
                replacementOptions.length === 0
              }
              onClick={() => {
                void handleApplyReplacement();
              }}
            >
              {changeBattersMutation.isPending ? "Applying..." : "Apply"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormGroup label="Batter">
            <SelectField
              options={[
                { value: "", label: "Select batter" },
                ...replacementOptions,
              ]}
              value={replacementBatterId}
              onChange={(event) => setReplacementBatterId(event.target.value)}
              disabled={changeBattersMutation.isPending}
            />
          </FormGroup>
        </div>
      </CenterModal>
    </Card>
  );
};
