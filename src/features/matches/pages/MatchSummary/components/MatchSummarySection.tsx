import { useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { Tabs } from "@/components/ui/tabs/Tabs";
import { useMatchSummary } from "@/features/matches/hooks/useMatchSummary";
import type {
  BattingRowSummary,
  BowlingRowSummary,
  FallOfWicketSummary,
  InningsSummary,
} from "@/features/matches/types/matchSummary.types";
import { formatMatchOutcome } from "@/features/matches/utils/formatMatchOutcome";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Card } from "@/shared/components/card/Card";
import { SkeletonBlock } from "@/shared/components/skeletons/SkeletonBlock";
import { StatusBadge } from "@/shared/components/status/StatusBadge";
import { Table, type TableColumn } from "@/shared/components/table/Table";

type Props = {
  matchId: string;
};

const fallback = (value: string | number | null | undefined, empty = "-") =>
  value === null || value === undefined || value === "" ? empty : String(value);

const formatRate = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) return "-";
  const two = value.toFixed(2);
  if (two.endsWith("00")) return value.toFixed(1);
  if (two.endsWith("0")) return two.slice(0, -1);
  return two;
};

const formatDismissal = (row: BattingRowSummary) => {
  if (!row.isOut) return "not out";
  if (row.dismissalText) return row.dismissalText;
  if (row.dismissalKind) {
    const extras = [row.bowlerName, row.fielderName]
      .filter(Boolean)
      .join(" / ");
    return extras ? `${row.dismissalKind} (${extras})` : row.dismissalKind;
  }
  return "out";
};

const formatFow = (item: FallOfWicketSummary) =>
  `${fallback(item.wicket)}-${fallback(item.runs)} (${fallback(item.over)}) ${fallback(
    item.batterName,
  )}${item.kind ? `, ${item.kind}` : ""}`;

const formatTeamScoreLine = (innings: InningsSummary | undefined) =>
  innings
    ? `${fallback(innings.runs, "0")}/${fallback(innings.wickets, "0")} (${fallback(
        innings.overs,
        "0.0",
      )})`
    : "-/- (-)";

const resultBadgeClassName = (badge: string) => {
  if (badge === "WIN") return "border-success-80 bg-success-95 text-success-30";
  if (badge === "TIE")
    return "border-secondary-80 bg-secondary-95 text-secondary-30";
  if (badge === "NO RESULT")
    return "border-neutral-80 bg-neutral-95 text-neutral-40";
  return "border-warning-80 bg-warning-95 text-warning-30";
};

const battingColumns: TableColumn<BattingRowSummary>[] = [
  {
    key: "name",
    header: "Batter",
    className: "w-[52%]",
    render: (row) => (
      <div>
        <p className="font-medium text-primary-10">{fallback(row.name)}</p>
        <p className="text-xs text-neutral-40">{formatDismissal(row)}</p>
      </div>
    ),
  },
  {
    key: "r",
    header: "R",
    align: "right",
    className: "w-[9%] tabular-nums",
    render: (row) => fallback(row.runs),
  },
  {
    key: "b",
    header: "B",
    align: "right",
    className: "w-[9%] tabular-nums",
    render: (row) => fallback(row.balls),
  },
  {
    key: "4s",
    header: "4s",
    align: "right",
    className: "w-[9%] tabular-nums",
    render: (row) => fallback(row.fours),
  },
  {
    key: "6s",
    header: "6s",
    align: "right",
    className: "w-[9%] tabular-nums",
    render: (row) => fallback(row.sixes),
  },
  {
    key: "sr",
    header: "SR",
    align: "right",
    className: "w-[12%] tabular-nums",
    render: (row) => formatRate(row.strikeRate),
  },
];

const bowlingColumns: TableColumn<BowlingRowSummary>[] = [
  {
    key: "name",
    header: "Bowler",
    className: "w-[52%]",
    render: (row) => fallback(row.name),
  },
  {
    key: "o",
    header: "O",
    align: "right",
    className: "w-[9%] tabular-nums",
    render: (row) => fallback(row.overs),
  },
  {
    key: "m",
    header: "M",
    align: "right",
    className: "w-[9%] tabular-nums",
    render: (row) => fallback(row.maidens),
  },
  {
    key: "r",
    header: "R",
    align: "right",
    className: "w-[9%] tabular-nums",
    render: (row) => fallback(row.runs),
  },
  {
    key: "w",
    header: "W",
    align: "right",
    className: "w-[9%] tabular-nums",
    render: (row) => fallback(row.wickets),
  },
  {
    key: "er",
    header: "ER",
    align: "right",
    className: "w-[12%] tabular-nums",
    render: (row) => formatRate(row.economy),
  },
];

const InningsCard = ({ innings }: { innings: InningsSummary }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
          Innings {innings.inningsNumber}
        </p>
      </div>
    </div>

    <div>
      {/*  */}
      <Table
        columns={battingColumns}
        rows={innings.batting}
        rowKey={(row, index) => `${row.playerId ?? row.name}-${index}`}
        emptyState={<p className="text-sm text-neutral-40">No batting data.</p>}
      />
    </div>

    <div className="border-t border-neutral-90 pt-4 text-sm text-neutral-40">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-primary-10">Extras</p>
        <div className="text-right">
          <p className="mt-1 whitespace-nowrap  text-primary-10">
            <span className="font-semibold">
              {fallback(innings.extras.total, "0")}
            </span>{" "}
            (Wd {fallback(innings.extras.wides, "0")}, Nb{" "}
            {fallback(innings.extras.noBalls, "0")}, B{" "}
            {fallback(innings.extras.byes, "0")}, LB{" "}
            {fallback(innings.extras.legByes, "0")})
          </p>
        </div>
      </div>
    </div>

    <div className="border-t border-neutral-90 pt-4 text-neutral-40 text-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-primary-10">Total</p>
        <p className="text-right font-semibold text-primary-10">
          {fallback(innings.runs, "0")}/{fallback(innings.wickets, "0")} (
          {fallback(innings.overs, "0.0")} ov)
        </p>
      </div>
    </div>

    <div className="border-t border-neutral-90 pt-4">
      <p className="font-semibold text-primary-10 mb-2 text-sm">
        Fall of wickets
      </p>
      {innings.fallOfWickets.length === 0 ? (
        <p className="text-sm text-neutral-40">No wickets yet.</p>
      ) : (
        <ul className="space-y-1 text-sm text-primary-10">
          {innings.fallOfWickets.map((item, index) => (
            <li key={`${item.wicket ?? index}-${item.over ?? index}`}>
              {formatFow(item)}
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="pt-3 border-t border-neutral-90">
      <Table
        columns={bowlingColumns}
        rows={innings.bowling}
        rowKey={(row, index) => `${row.playerId ?? row.name}-${index}`}
        emptyState={<p className="text-sm text-neutral-40">No bowling data.</p>}
      />
    </div>
  </div>
);

export const MatchSummarySection = ({ matchId }: Props) => {
  const summaryQuery = useMatchSummary(matchId);
  const [activeInningsIndex, setActiveInningsIndex] = useState(0);

  if (summaryQuery.isLoading) {
    return (
      <Card className="space-y-4">
        <SkeletonBlock className="h-7 w-56 rounded-full" />
        <SkeletonBlock className="h-20 w-full rounded-2xl" />
        <SkeletonBlock className="h-56 w-full rounded-2xl" />
      </Card>
    );
  }

  if (summaryQuery.isError) {
    return (
      <Card className="space-y-4">
        <div className="rounded-xl border border-error-80 bg-error-95 p-4 text-sm text-error-40">
          {summaryQuery.error instanceof Error
            ? summaryQuery.error.message
            : "Unable to load match summary."}
        </div>
        <Button
          type="button"
          appearance="outline"
          color="neutral"
          onClick={() => summaryQuery.refetch()}
        >
          Retry
        </Button>
      </Card>
    );
  }

  const summary = summaryQuery.data;
  if (!summary) {
    return null;
  }

  const resultOutcome = formatMatchOutcome(summary.match.result);
  const teamAInnings = summary.innings.find(
    (innings) =>
      innings.battingTeam?.id &&
      innings.battingTeam.id === summary.match.teamA?.id,
  );
  const teamBInnings = summary.innings.find(
    (innings) =>
      innings.battingTeam?.id &&
      innings.battingTeam.id === summary.match.teamB?.id,
  );
  const inningsTabs = summary.innings.map((innings, index) => ({
    index,
    label: fallback(innings.battingTeam?.name, `Innings ${index + 1}`),
  }));
  const selectedInnings =
    summary.innings[activeInningsIndex] ?? summary.innings[0];

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-40">
            <p>{fallback(summary.match.stage, "Match")}</p>
            <p>
              {fallback(summary.match.oversPerInnings, "0")} overs /{" "}
              {fallback(summary.match.ballsPerOver, "0")} balls
            </p>
          </div>
          <div className="mt-4 grid grid-cols-3 items-center gap-2 text-center justify-between w-full">
            <div>
              <p className="text-lg font-bold text-primary-10">
                {formatTeamScoreLine(teamAInnings)}
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-40">
                {fallback(summary.match.teamA?.name)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-40">
                {fallback(summary.match.status)}
              </p>
              <StatusBadge
                status={resultOutcome.badge}
                label={resultOutcome.badge}
                className={`mt-1 text-[10px] uppercase tracking-[0.12em] ${resultBadgeClassName(resultOutcome.badge)}`}
              />
            </div>
            <div>
              <p className="text-lg font-bold text-primary-10">
                {formatTeamScoreLine(teamBInnings)}
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-40">
                {fallback(summary.match.teamB?.name)}
              </p>
            </div>
          </div>

          <div className="text-center mt-4">
            <div>
              <p className="mt-2 text-sm font-semibold text-primary-30">
                {resultOutcome.text}
              </p>
            </div>
          </div>
        </div>

        {summary.innings.length === 0 ? (
          <EmptyState
            title="Innings not started"
            description="Summary will appear once play begins."
          />
        ) : null}
      </Card>

      {selectedInnings ? (
        <Card className="space-y-4">
          {summary.innings.length > 1 ? (
            <Tabs
              fullWidth
              value={String(activeInningsIndex)}
              onChange={(value) => setActiveInningsIndex(Number(value))}
              items={inningsTabs.map((tab) => ({
                value: String(tab.index),
                label: tab.label,
              }))}
            />
          ) : null}

          <InningsCard
            key={
              selectedInnings.inningsId ??
              `${selectedInnings.inningsNumber}-${activeInningsIndex}`
            }
            innings={selectedInnings}
          />
        </Card>
      ) : null}
    </div>
  );
};
