import { Card } from "@/shared/components/card/Card";
import { Table, type TableColumn } from "@/shared/components/table/Table";
import { classNames } from "@/shared/utils/classNames";
import { useInningsBattersQuery } from "../../hooks/useInningsBattersQuery";
import type { BatterRow } from "../../types/scoring.types";

type Props = {
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
  inningsId,
  strikerId,
  nonStrikerId,
  playerNameById,
  totalRuns,
  extrasBreakdown,
}: Props) => {
  const { data, isLoading, isError, error } = useInningsBattersQuery(inningsId);
  const normalizedStrikerId = strikerId ? String(strikerId).trim() : "";
  const normalizedNonStrikerId = nonStrikerId
    ? String(nonStrikerId).trim()
    : "";
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
  const columns: TableColumn<BatterRow>[] = [
    {
      key: "batter",
      header: "Batters",
      className: "w-col-batter px-5",
      headerClassName: tableHeaderClassName,
      cellClassName: "py-4 font-semibold text-on-surface",
      render: (row) => {
        const isStriker = !row.isOut && row.batterId === normalizedStrikerId;
        const isNotOut = !row.isOut;
        return (
          <>
            <span className="inline-flex items-center gap-2">
              <span
                className={classNames(
                  isNotOut
                    ? "font-semibold text-on-surface"
                    : "font-medium text-on-surface-muted",
                )}
              >
                {row.name}
              </span>

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
      {data?.items?.length ? (
        <Table
          columns={columns}
          rows={data.items}
          rowKey={(row) => row.batterId}
          wrapperClassName="md:overflow-visible"
          tableClassName="min-w-table-batter md:min-w-0"
          rowClassName={(row) =>
            row.batterId === normalizedStrikerId
              ? "border-outline-variant bg-surface-container-high text-on-surface"
              : !row.isOut
                ? "border-outline-variant text-on-surface-muted"
                : "border-outline-variant text-on-surface-muted/70"
          }
        />
      ) : !isLoading && !isError ? (
        openingBatters.length ? (
          <div className="m-4 rounded-xl border border-outline bg-surface-container-high p-3 text-sm text-on-primary-container">
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Opening batters
            </p>
            <ul className="mt-2 space-y-1">
              {openingBatters.map((batter) => (
                <li key={batter.id} className="flex items-center gap-2">
                  <span>{batter.name}</span>
                  {batter.isStriker ? (
                    <span className="rounded-full bg-primary-container px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-on-primary-container">
                      Striker
                    </span>
                  ) : (
                    <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                      Non-striker
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="px-5 py-3 text-sm text-on-surface-variant">
            No batters yet.
          </p>
        )
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
    </Card>
  );
};
