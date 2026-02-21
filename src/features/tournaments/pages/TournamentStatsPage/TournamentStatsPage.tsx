import { useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button/Button";
import { Card } from "@/shared/components/card/Card";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { SkeletonBlock } from "@/shared/components/skeletons/SkeletonBlock";
import { Table, type TableColumn } from "@/shared/components/table/Table";
import { useTournamentStatsQuery } from "@/features/tournaments/hooks/useTournamentStatsQuery";
import { useTournament } from "@/features/tournaments/hooks/useTournament";
import type {
  StatsRowBase,
  TournamentStatsResponse,
  TournamentStatsSections,
} from "@/features/tournaments/types/tournamentStats.types";

type SectionKey = keyof TournamentStatsSections;
type StatsRenderRow = StatsRowBase & Record<string, unknown>;

type ColumnConfig = {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: StatsRenderRow) => string;
};

type SectionConfig = {
  key: SectionKey;
  title: string;
  columns: ColumnConfig[];
};

const createSectionConfig = (config: SectionConfig) => config;

const teamLabel = (row: StatsRowBase) =>
  row.team?.name || row.team?.shortName || "-";

const formatNumber = (value: unknown, digits = 2) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-";
const formatAverage = (row: StatsRenderRow) => {
  const average = row.average;
  const dismissals = row.dismissals;
  const runs = row.runs;
  if (
    (typeof dismissals === "number" && dismissals === 0) ||
    (typeof average === "number" &&
      average === 0 &&
      typeof runs === "number" &&
      runs > 0)
  ) {
    return "NA";
  }
  return formatNumber(average);
};
const asCount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "-";
const asFigure = (wickets: unknown, runsConceded: unknown) =>
  typeof wickets === "number" && typeof runsConceded === "number"
    ? `${wickets}/${runsConceded}`
    : "-";
const metricWidthClass = (columnKey: string) => {
  if (columnKey === "innings") return "w-14";
  if (columnKey === "matches") return "w-16";
  if (columnKey === "runs") return "w-16";
  if (columnKey === "wickets") return "w-16";
  if (columnKey === "average") return "w-16";
  if (columnKey === "strikeRate") return "w-16";
  if (columnKey === "highestScore") return "w-16";
  if (columnKey === "figures") return "w-16";
  if (columnKey === "bb") return "w-16";
  if (columnKey === "100s") return "w-16";
  if (columnKey === "50s") return "w-16";
  if (columnKey === "5w") return "w-16";
  if (columnKey === "6s") return "w-16";
  if (columnKey === "4s") return "w-16";
  if (columnKey === "boundaries") return "w-16";
  if (columnKey === "overs") return "w-16";
  if (columnKey === "eco") return "w-16";
  return "";
};
const playerColumnWidthClass = () => "w-full";

const sectionConfigs: readonly SectionConfig[] = [
  createSectionConfig({
    key: "runs",
    title: "Runs",
    columns: [
      {
        key: "innings",
        header: "Inn",
        align: "right",
        render: (row) => asCount(row.innings),
      },
      {
        key: "runs",
        header: "Runs",
        align: "right",
        render: (row) => asCount(row.runs),
      },
      {
        key: "average",
        header: "Avg",
        align: "right",
        render: (row) => formatAverage(row),
      },
    ],
  }),
  createSectionConfig({
    key: "wickets",
    title: "Wickets",
    columns: [
      {
        key: "innings",
        header: "Inn",
        align: "right",
        render: (row) => asCount(row.innings),
      },
      {
        key: "wickets",
        header: "Wkts",
        align: "right",
        render: (row) => asCount(row.wickets),
      },
      {
        key: "eco",
        header: "Econ",
        align: "right",
        render: (row) => formatNumber(row.economy),
      },
    ],
  }),
  createSectionConfig({
    key: "highestScores",
    title: "Highest Scores",
    columns: [
      {
        key: "highestScore",
        header: "HS",
        align: "right",
        render: (row) => asCount(row.highestScore),
      },
      {
        key: "strikeRate",
        header: "SR",
        align: "right",
        render: (row) => formatNumber(row.strikeRate),
      },
    ],
  }),
  createSectionConfig({
    key: "bestBowlingFigures",
    title: "Best Bowling Figures",
    columns: [
      {
        key: "overs",
        header: "Overs",
        align: "right",
        render: (row) => formatNumber(row.overs, 1),
      },
      {
        key: "eco",
        header: "Econ",
        align: "right",
        render: (row) => formatNumber(row.economy),
      },
      {
        key: "bb",
        header: "BB",
        align: "right",
        render: (row) =>
          row.bestBowling
            ? String(row.bestBowling)
            : asFigure(row.wickets, row.runsConceded),
      },
    ],
  }),
  createSectionConfig({
    key: "battingAverage",
    title: "Batting Average",
    columns: [
      {
        key: "matches",
        header: "M",
        align: "right",
        render: (row) => asCount(row.matches ?? row.innings),
      },
      {
        key: "runs",
        header: "Runs",
        align: "right",
        render: (row) => asCount(row.runs),
      },
      {
        key: "avg",
        header: "Avg",
        align: "right",
        render: (row) => formatAverage(row),
      },
    ],
  }),
  createSectionConfig({
    key: "bowlingAverage",
    title: "Bowling Average",
    columns: [
      {
        key: "matches",
        header: "M",
        align: "right",
        render: (row) => asCount(row.matches ?? row.innings),
      },
      {
        key: "w",
        header: "W",
        align: "right",
        render: (row) => asCount(row.wickets),
      },
      {
        key: "avg",
        header: "Avg",
        align: "right",
        render: (row) => formatAverage(row),
      },
    ],
  }),
  createSectionConfig({
    key: "mostHundreds",
    title: "Most Hundreds",
    columns: [
      {
        key: "matches",
        header: "M",
        align: "right",
        render: (row) => asCount(row.matches ?? row.innings),
      },
      {
        key: "runs",
        header: "Runs",
        align: "right",
        render: (row) => asCount(row.runs),
      },
      {
        key: "100s",
        header: "100s",
        align: "right",
        render: (row) => asCount(row.hundreds),
      },
    ],
  }),
  createSectionConfig({
    key: "mostFifties",
    title: "Most Fifties",
    columns: [
      {
        key: "matches",
        header: "M",
        align: "right",
        render: (row) => asCount(row.matches ?? row.innings),
      },
      {
        key: "runs",
        header: "Runs",
        align: "right",
        render: (row) => asCount(row.runs),
      },
      {
        key: "50s",
        header: "50s",
        align: "right",
        render: (row) => asCount(row.fifties),
      },
    ],
  }),
  createSectionConfig({
    key: "mostEconomicalBowlers",
    title: "Most Economical Bowlers",
    columns: [
      {
        key: "overs",
        header: "Overs",
        align: "right",
        render: (row) => formatNumber(row.overs, 1),
      },
      {
        key: "runs",
        header: "Runs",
        align: "right",
        render: (row) => asCount(row.runsConceded),
      },
      {
        key: "eco",
        header: "Eco",
        align: "right",
        render: (row) => formatNumber(row.economy),
      },
    ],
  }),
  createSectionConfig({
    key: "fiveWicketHauls",
    title: "Five Wicket Hauls",
    columns: [
      {
        key: "matches",
        header: "M",
        align: "right",
        render: (row) => asCount(row.matches ?? row.innings),
      },
      {
        key: "wickets",
        header: "W",
        align: "right",
        render: (row) => asCount(row.wickets),
      },
      {
        key: "5w",
        header: "5W",
        align: "right",
        render: (row) => asCount(row.fiveWicketHauls),
      },
    ],
  }),
  createSectionConfig({
    key: "sixes",
    title: "Sixes",
    columns: [
      {
        key: "matches",
        header: "M",
        align: "right",
        render: (row) => asCount(row.matches ?? row.innings),
      },
      {
        key: "runs",
        header: "Runs",
        align: "right",
        render: (row) => asCount(row.runs),
      },
      {
        key: "6s",
        header: "6s",
        align: "right",
        render: (row) => asCount(row.sixes),
      },
    ],
  }),
  createSectionConfig({
    key: "fours",
    title: "Fours",
    columns: [
      {
        key: "matches",
        header: "M",
        align: "right",
        render: (row) => asCount(row.matches ?? row.innings),
      },
      {
        key: "runs",
        header: "Runs",
        align: "right",
        render: (row) => asCount(row.runs),
      },
      {
        key: "4s",
        header: "4s",
        align: "right",
        render: (row) => asCount(row.fours),
      },
    ],
  }),
  createSectionConfig({
    key: "boundaries",
    title: "Boundaries",
    columns: [
      {
        key: "4s",
        header: "4s",
        align: "right",
        render: (row) => asCount(row.fours),
      },
      {
        key: "6s",
        header: "6s",
        align: "right",
        render: (row) => asCount(row.sixes),
      },
      {
        key: "boundaries",
        header: "Bnd",
        align: "right",
        render: (row) => asCount(row.boundaries),
      },
    ],
  }),
];

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "-";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const SectionCard = ({
  config,
  rows,
  limit,
}: {
  config: SectionConfig;
  rows: StatsRowBase[];
  limit: number;
}) => {
  const isBoundaries = config.key === "boundaries";

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-20">
          {config.title}
        </h3>
        <p className="text-xs text-neutral-40">Top {limit}</p>
      </div>

      <Table
        columns={[
          {
            key: "rank",
            header: "#",
            align: "left",
            className: "w-12 min-w-12 tabular-nums",
            render: (row) => row.rank,
          },
          {
            key: "player",
            header: "Player",
            align: "left",
            className: playerColumnWidthClass(),
            render: (row) => (
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-95 text-xs font-semibold text-primary-20">
                  {initials(row.name)}
                </span>
                <span className="flex flex-col">
                  <span>{row.name || "-"}</span>
                  <span className="text-xs text-neutral-40">
                    {teamLabel(row)}
                  </span>
                </span>
              </div>
            ),
          },
          ...config.columns.map(
            (column): TableColumn<StatsRowBase> => ({
              key: column.key,
              header: column.header,
              align: column.align === "right" ? "right" : "left",
              className: `${metricWidthClass(column.key)} tabular-nums`,
              render: (row) => column.render(row),
            }),
          ),
        ]}
        rows={rows}
        rowKey={(row, index) => `${row.playerId ?? row.name}-${index}`}
        emptyState={<p className="text-sm text-neutral-40">No data yet</p>}
        tableClassName={isBoundaries ? "min-w-[560px]" : "min-w-[420px]"}
      />
    </Card>
  );
};

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} className="space-y-3 p-4">
        <SkeletonBlock className="h-4 w-40 rounded-full" />
        <SkeletonBlock className="h-28 w-full rounded-xl" />
      </Card>
    ))}
  </div>
);

const renderSectionCard = (
  config: SectionConfig,
  stats: TournamentStatsResponse,
) => (
  <SectionCard
    key={config.key}
    config={config}
    rows={stats.sections[config.key]}
    limit={stats.limits[config.key]}
  />
);

export const TournamentStatsPage = () => {
  const { tournamentId } = useParams({
    from: "/tournaments/$tournamentId/stats",
  });
  const statsQuery = useTournamentStatsQuery(tournamentId);
  const tournamentQuery = useTournament(tournamentId);
  const header = (
    <PageHeader
      eyebrow="Tournament"
      title={`${tournamentQuery.data?.name ?? "Tournament"} Stats`}
      description="Top performers across batting and bowling metrics."
    />
  );

  if (statsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {header}
        <StatsSkeleton />
      </div>
    );
  }

  if (statsQuery.isError) {
    return (
      <div className="space-y-4 ">
        {header}
        <Card className="space-y-4">
          <div className="rounded-xl border border-error-80 bg-error-95 p-4 text-sm text-error-40">
            {statsQuery.error instanceof Error
              ? statsQuery.error.message
              : "Unable to load tournament stats."}
          </div>
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            onClick={() => statsQuery.refetch()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const stats = statsQuery.data as TournamentStatsResponse | undefined;
  if (!stats) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState title="No stats data" description="No data yet" />
      </div>
    );
  }

  const allSectionsEmpty = sectionConfigs.every(
    (config) => stats.sections[config.key].length === 0,
  );
  const visibleSections = sectionConfigs.filter(
    (config) => stats.sections[config.key].length > 0,
  );

  if (allSectionsEmpty) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState
          title="No data yet"
          description="Stats will appear once matches are played."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 mx-auto w-full max-w-5xl">
      {header}
      <div className="grid grid-cols-1 gap-4 ">
        {visibleSections.map((config) => renderSectionCard(config, stats))}
      </div>
    </div>
  );
};
