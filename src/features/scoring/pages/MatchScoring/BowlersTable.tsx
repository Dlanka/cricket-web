import { Card } from "@/shared/components/card/Card";
import { Table, type TableColumn } from "@/shared/components/table/Table";
import { classNames } from "@/shared/utils/classNames";
import { useInningsBowlersQuery } from "../../hooks/useInningsBowlersQuery";
import type { BowlerRow } from "../../types/scoring.types";

type Props = {
  inningsId: string;
  currentBowlerId: string;
  playerNameById?: Record<string, string>;
};

export const BowlersTable = ({
  inningsId,
  currentBowlerId,
  playerNameById,
}: Props) => {
  const { data, isLoading, isError, error } = useInningsBowlersQuery(inningsId);
  const bowlers = data?.items ?? [];
  const hasCurrentBowlerInRows = bowlers.some(
    (row) => row.bowlerId === currentBowlerId,
  );
  const bowlersWithCurrent =
    !hasCurrentBowlerInRows && currentBowlerId
      ? [
          {
            bowlerId: currentBowlerId,
            name: playerNameById?.[currentBowlerId] ?? currentBowlerId,
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
    if (a.bowlerId === currentBowlerId) return -1;
    if (b.bowlerId === currentBowlerId) return 1;
    return 0;
  });
  const tableHeaderClassName =
    "pb-3 pt-3 font-display text-2xs font-bold tracking-widest uppercase text-on-surface-subtle";
  const columns: TableColumn<BowlerRow>[] = [
    {
      key: "bowler",
      header: "Bowler",
      className: "w-col-batter px-5",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-semibold",
      render: (row) => {
        const isCurrentBowler = row.bowlerId === currentBowlerId;
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className={classNames(
                isCurrentBowler
                  ? "font-semibold text-on-surface"
                  : "font-medium text-on-surface-muted",
              )}
            >
              {row.name}
            </span>
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
            row.bowlerId === currentBowlerId
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
      <div className="px-5 py-4 border-b border-outline">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-on-surface-muted">
          Bowlers
        </p>
      </div>
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
            row.bowlerId === currentBowlerId
              ? "border-outline-variant bg-surface-container-high text-on-surface"
              : "border-outline-variant text-on-surface-muted"
          }
        />
      ) : !isLoading && !isError ? (
        currentBowlerId ? (
          <div className="m-4 rounded-xl border border-outline bg-surface-container-high p-3 text-sm text-on-primary-container">
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Opening bowler
            </p>
            <p className="mt-2 flex items-center gap-2">
              <span>
                {playerNameById?.[currentBowlerId] ?? currentBowlerId}
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
    </Card>
  );
};
