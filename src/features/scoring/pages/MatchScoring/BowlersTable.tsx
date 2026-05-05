import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/card/Card";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { CenterModal } from "@/shared/components/modals/CenterModal";
import { Table, type TableColumn } from "@/shared/components/table/Table";
import { usePlayersByTeamQuery } from "@/features/players/hooks/usePlayersByTeamQuery";
import { useMatchRosterQuery } from "@/features/roster/hooks/useMatchRosterQuery";
import { classNames } from "@/shared/utils/classNames";
import { useChangeCurrentBowlerMutation } from "../../hooks/useChangeCurrentBowlerMutation";
import { useInningsBowlersQuery } from "../../hooks/useInningsBowlersQuery";
import type { BowlerRow } from "../../types/scoring.types";

type Props = {
  matchId: string;
  bowlingTeamId: string;
  inningsId: string;
  currentBowlerId: string;
  currentBalls: number;
  ballsPerOver: number;
  isChangeBowlerState?: boolean;
  playerNameById?: Record<string, string>;
};

export const BowlersTable = ({
  matchId,
  bowlingTeamId,
  inningsId,
  currentBowlerId,
  currentBalls,
  ballsPerOver,
  isChangeBowlerState = false,
  playerNameById,
}: Props) => {
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [selectedBowlerId, setSelectedBowlerId] = useState("");
  const changeBowlerMutation = useChangeCurrentBowlerMutation(matchId, inningsId);
  const rosterQuery = useMatchRosterQuery(matchId);
  const bowlingPlayersQuery = usePlayersByTeamQuery(bowlingTeamId);
  const { data, isLoading, isError, error } = useInningsBowlersQuery(inningsId);
  const normalizedCurrentBowlerId = String(currentBowlerId ?? "").trim();
  const canChangeBowlerNow =
    ballsPerOver > 0 && currentBalls % ballsPerOver === 0;
  const bowlingPlayingIds = useMemo(
    () =>
      rosterQuery.data?.teams
        .find((team) => team.teamId === bowlingTeamId)
        ?.players.filter((player) => player.isPlaying)
        .map((player) => player.playerId) ?? [],
    [bowlingTeamId, rosterQuery.data?.teams],
  );
  const nextBowlerOptions = (bowlingPlayersQuery.data ?? [])
    .filter((player) => bowlingPlayingIds.includes(player.id))
    .filter((player) => player.id !== normalizedCurrentBowlerId)
    .map((player) => ({
      value: player.id,
      label: `${player.fullName}${player.jerseyNumber != null ? ` (#${player.jerseyNumber})` : ""}`,
    }));

  const openChangeBowlerModal = (prefillBowlerId?: string) => {
    if (!canChangeBowlerNow) {
      toast.error("Bowler can be changed only when current over balls are 0.");
      return;
    }
    setSelectedBowlerId(prefillBowlerId ?? "");
    setReplaceModalOpen(true);
  };

  const selectAsNextBowler = async (bowlerId: string) => {
    if (!canChangeBowlerNow || !isChangeBowlerState) {
      return;
    }
    if (!bowlerId || bowlerId === normalizedCurrentBowlerId) {
      return;
    }
    try {
      await changeBowlerMutation.mutateAsync(bowlerId);
      toast.success("Current bowler updated.");
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || "Unable to change current bowler.");
    }
  };

  const handleApplyBowler = async () => {
    if (!selectedBowlerId) {
      toast.error("Select bowler.");
      return;
    }
    try {
      await changeBowlerMutation.mutateAsync(selectedBowlerId);
      toast.success("Current bowler updated.");
      setReplaceModalOpen(false);
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || "Unable to change current bowler.");
    }
  };

  const bowlers = data?.items ?? [];
  const hasCurrentBowlerInRows = bowlers.some(
    (row) => String(row.bowlerId).trim() === normalizedCurrentBowlerId,
  );
  const bowlersWithCurrent =
    !hasCurrentBowlerInRows && normalizedCurrentBowlerId
      ? [
          {
            bowlerId: normalizedCurrentBowlerId,
            name: playerNameById?.[normalizedCurrentBowlerId] ?? normalizedCurrentBowlerId,
            balls: 0,
            overs: "0.0",
            runsConceded: 0,
            wickets: 0,
            maidens: 0,
            wides: 0,
            noBalls: 0,
            er: 0,
          },
          ...bowlers,
        ]
      : bowlers;
  const orderedBowlers = [...bowlersWithCurrent].sort((a, b) => {
    if (String(a.bowlerId).trim() === normalizedCurrentBowlerId) return -1;
    if (String(b.bowlerId).trim() === normalizedCurrentBowlerId) return 1;
    return 0;
  });
  const tableHeaderClassName =
    "pb-3 pt-3 font-display text-2xs font-bold tracking-widest uppercase text-on-surface-subtle";
  const columns: TableColumn<BowlerRow>[] = [
    {
      key: "bowler",
      header: "Bowlers",
      className: "w-col-batter px-5",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-semibold",
      render: (row) => {
        const isCurrentBowler =
          String(row.bowlerId).trim() === normalizedCurrentBowlerId;
        return (
          <span className="inline-flex items-center gap-2">
            {isCurrentBowler ? (
              <button
                type="button"
                className={classNames(
                  "rounded px-0 text-left font-semibold text-on-surface transition hover:text-on-primary-container",
                  canChangeBowlerNow ? "cursor-pointer" : "cursor-not-allowed opacity-80",
                )}
                onClick={() => openChangeBowlerModal()}
                title={
                  canChangeBowlerNow
                    ? "Change current bowler"
                    : "Bowler can be changed only when current over balls are 0"
                }
              >
                {row.name}
              </button>
            ) : (
              <button
                type="button"
                className={classNames(
                  "rounded px-0 text-left font-medium text-on-surface-muted transition hover:text-on-primary-container",
                  canChangeBowlerNow && isChangeBowlerState
                    ? "cursor-pointer"
                    : "cursor-default",
                )}
                disabled={!canChangeBowlerNow || !isChangeBowlerState}
                onClick={() => {
                  void selectAsNextBowler(String(row.bowlerId).trim());
                }}
                title={
                  canChangeBowlerNow && isChangeBowlerState
                    ? "Select as next bowler"
                    : "Bowler can be changed only when current over balls are 0"
                }
              >
                {row.name}
              </button>
            )}
            {isCurrentBowler ? (
              <span className="rounded-full bg-primary-container size-1.5"></span>
            ) : null}
          </span>
        );
      },
    },
    {
      key: "overs",
      header: "O",
      align: "right",
      className: "w-col-stat px-3",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => row.overs,
    },
    {
      key: "runs",
      header: "R",
      align: "right",
      className: "w-col-stat px-3",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => row.runsConceded,
    },
    {
      key: "wickets",
      header: "W",
      align: "right",
      className: "w-col-stat px-3",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => row.wickets,
    },
    {
      key: "maidens",
      header: "M",
      align: "right",
      className: "w-col-stat px-3",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => row.maidens,
    },
    {
      key: "er",
      header: "ER",
      align: "right",
      className: "w-col-sr px-5",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-mono font-semibold",
      render: (row) => (
        <span
          className={
            String(row.bowlerId).trim() === normalizedCurrentBowlerId
              ? "text-error"
              : "text-on-surface-muted"
          }
        >
          {row.er}
        </span>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden border-outline bg-surface-container p-0!">
      {isLoading ? (
        <p className="px-5 py-3 text-sm text-on-surface-variant">
          Loading bowlers...
        </p>
      ) : null}
      {isError ? (
        <p className="px-5 py-3 text-sm text-on-error-container">
          {error instanceof Error ? error.message : "Unable to load bowlers."}
        </p>
      ) : null}
      {bowlersWithCurrent.length ? (
        <Table
          columns={columns}
          rows={orderedBowlers}
          rowKey={(row) => row.bowlerId}
          wrapperClassName="md:overflow-visible"
          tableClassName="min-w-140 md:min-w-0"
          rowClassName={(row) =>
            String(row.bowlerId).trim() === normalizedCurrentBowlerId
              ? "border-outline-variant bg-surface-container-high text-on-surface"
              : "border-outline-variant text-on-surface-muted"
          }
        />
      ) : !isLoading && !isError ? (
        normalizedCurrentBowlerId ? (
          <div className="m-4 rounded-xl border border-outline bg-surface-container-high p-3 text-sm text-on-primary-container">
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Opening bowler
            </p>
            <p className="mt-2 flex items-center gap-2">
              <span>
                {playerNameById?.[normalizedCurrentBowlerId] ?? normalizedCurrentBowlerId}
              </span>
              <span className="rounded-full bg-primary-container px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-on-surface">
                Current
              </span>
            </p>
          </div>
        ) : (
          <p className="px-5 py-3 text-sm text-on-surface-variant">
            No bowlers yet.
          </p>
        )
      ) : null}
      <CenterModal
        isOpen={replaceModalOpen}
        onClose={
          changeBowlerMutation.isPending
            ? () => undefined
            : () => setReplaceModalOpen(false)
        }
        title="Change bowler"
        description="Select next bowler (allowed only at ball count 0 in current over)."
        closeOnOverlayClick={!changeBowlerMutation.isPending}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              appearance="outline"
              color="neutral"
              size="sm"
              disabled={changeBowlerMutation.isPending}
              onClick={() => setReplaceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={changeBowlerMutation.isPending || !selectedBowlerId}
              onClick={() => {
                void handleApplyBowler();
              }}
            >
              {changeBowlerMutation.isPending ? "Applying..." : "Apply"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormGroup label="Bowler">
            <SelectField
              options={[
                { value: "", label: "Select bowler" },
                ...nextBowlerOptions,
              ]}
              value={selectedBowlerId}
              onChange={(event) => setSelectedBowlerId(event.target.value)}
              disabled={changeBowlerMutation.isPending}
            />
          </FormGroup>
        </div>
      </CenterModal>
    </Card>
  );
};
