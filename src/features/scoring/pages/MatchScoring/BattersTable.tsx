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
    if (outKind === "runOutStriker" || outKind === "runOutNonStriker") {
      return "run out";
    }
    return outKind;
  };
  const columns: TableColumn<BatterRow>[] = [
    {
      key: "batter",
      header: "Batter",
      className: "pl-1 w-[44%]",
      render: (row) => {
        const isStriker = !row.isOut && row.batterId === normalizedStrikerId;
        const isNotOut = !row.isOut;
        return (
          <>
            <span className="inline-flex items-center gap-2">
              <span className={classNames(isNotOut && "font-medium")}>
                {row.name}
              </span>
              {isStriker ? (
                <span className="flex size-1.5 rounded-full bg-primary-50"></span>
              ) : null}
            </span>
            {row.isOut ? (
              <span className="ml-2 text-xs text-neutral-40">
                ({formatOutKind(row.outKind)})
              </span>
            ) : null}
          </>
        );
      },
    },
    { key: "runs", header: "R", align: "right", className: "w-[11%]", render: (row) => row.runs },
    { key: "balls", header: "B", align: "right", className: "w-[11%]", render: (row) => row.balls },
    { key: "fours", header: "4s", align: "right", className: "w-[11%]", render: (row) => row.fours },
    { key: "sixes", header: "6s", align: "right", className: "w-[11%]", render: (row) => row.sixes },
    {
      key: "sr",
      header: "SR",
      align: "right",
      className: "w-[13%] pr-1",
      render: (row) => row.sr,
    },
  ];

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
        Batters
      </p>

      {isLoading ? (
        <p className="mt-3 text-sm text-neutral-40">Loading batters...</p>
      ) : null}
      {isError ? (
        <p className="mt-3 text-sm text-error-40">
          {error instanceof Error ? error.message : "Unable to load batters."}
        </p>
      ) : null}
      {data?.items?.length ? (
        <Table
          columns={columns}
          rows={data.items}
          rowKey={(row) => row.batterId}
          wrapperClassName="mt-3 md:overflow-visible"
          tableClassName="min-w-[520px] md:min-w-0"
          rowClassName={(row) =>
            !row.isOut
              ? "border-primary-95 text-primary-10"
              : "border-neutral-95 text-neutral-50"
          }
        />
      ) : !isLoading && !isError ? (
        openingBatters.length ? (
          <div className="mt-3 rounded-xl border border-neutral-90 bg-neutral-99 p-3 text-sm text-primary-20">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-40">
              Opening batters
            </p>
            <ul className="mt-2 space-y-1">
              {openingBatters.map((batter) => (
                <li key={batter.id} className="flex items-center gap-2">
                  <span>{batter.name}</span>
                  {batter.isStriker ? (
                    <span className="rounded-full bg-primary-20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-100">
                      Striker
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-40">
                      Non-striker
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-40">No batters yet.</p>
        )
      ) : null}
      {!isLoading && !isError ? (
        <div className="text-xs text-neutral-40">
          <div className="border-t border-neutral-90"></div>

          <div className="py-3 flex items-center justify-between ">
            <span className="font-medium uppercase tracking-[0.12em]">
              Extras
            </span>
            <span className="text-right  text-primary-20">
              <span className="font-semibold"> {extrasTotal}</span>{" "}
              <span className="text-primary-70">{extrasDetails}</span>
            </span>
          </div>

          <div className=" border-t border-neutral-90"></div>

          <div className="py-3 flex items-center justify-between">
            <span className="font-medium uppercase tracking-[0.12em]">
              Total runs
            </span>
            <span className="text-right font-semibold text-primary-20">
              {resolvedTotalRuns}
            </span>
          </div>
        </div>
      ) : null}
    </Card>
  );
};
