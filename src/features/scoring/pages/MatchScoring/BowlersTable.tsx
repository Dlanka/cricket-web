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

export const BowlersTable = ({ inningsId, currentBowlerId, playerNameById }: Props) => {
  const { data, isLoading, isError, error } = useInningsBowlersQuery(inningsId);
  const bowlers = data?.items ?? [];
  const hasCurrentBowlerInRows = bowlers.some(
    (row) => row.bowlerId === currentBowlerId,
  );
  const bowlersWithCurrent = !hasCurrentBowlerInRows && currentBowlerId
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
  const columns: TableColumn<BowlerRow>[] = [
    {
      key: "bowler",
      header: "Bowler",
      className: "pl-1 w-[44%]",
      render: (row) => {
        const isCurrentBowler = row.bowlerId === currentBowlerId;
        return (
          <span className="inline-flex items-center gap-2">
            <span className={classNames(isCurrentBowler && "font-medium")}>
              {row.name}
            </span>
            {isCurrentBowler ? (
              <span className="rounded-full bg-primary-20 size-1.5"></span>
            ) : null}
          </span>
        );
      },
    },
    { key: "overs", header: "O", align: "right", className: "w-[11%]", render: (row) => row.overs },
    { key: "runs", header: "R", align: "right", className: "w-[11%]", render: (row) => row.runsConceded },
    { key: "wickets", header: "W", align: "right", className: "w-[11%]", render: (row) => row.wickets },
    { key: "maidens", header: "M", align: "right", className: "w-[11%]", render: (row) => row.maidens },
    { key: "er", header: "ER", align: "right", className: "w-[13%] pr-1", render: (row) => row.er },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
          Bowlers
        </p>
      </div>
      {isLoading ? (
        <p className="mt-3 text-sm text-neutral-40">Loading bowlers...</p>
      ) : null}
      {isError ? (
        <p className="mt-3 text-sm text-error-40">
          {error instanceof Error ? error.message : "Unable to load bowlers."}
        </p>
      ) : null}
      {bowlersWithCurrent.length ? (
        <Table
          columns={columns}
          rows={orderedBowlers}
          rowKey={(row) => row.bowlerId}
          wrapperClassName="mt-3 md:overflow-visible"
          tableClassName="min-w-140 md:min-w-0"
          rowClassName={(row) =>
            row.bowlerId === currentBowlerId
              ? "border-primary-90 text-primary-10"
              : "border-neutral-90 text-primary-10"
          }
        />
      ) : !isLoading && !isError ? (
        currentBowlerId ? (
          <div className="mt-3 rounded-xl border border-neutral-90 bg-neutral-99 p-3 text-sm text-primary-20">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-40">
              Opening bowler
            </p>
            <p className="mt-2 flex items-center gap-2">
              <span>{playerNameById?.[currentBowlerId] ?? currentBowlerId}</span>
              <span className="rounded-full bg-primary-20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-10">
                Current
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-40">No bowlers yet.</p>
        )
      ) : null}
    </Card>
  );
};
