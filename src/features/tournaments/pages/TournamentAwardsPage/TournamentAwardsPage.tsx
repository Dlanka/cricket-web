import { useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button/Button";
import { Card } from "@/shared/components/card/Card";
import { StatusPill } from "@/shared/components/badge/StatusPill";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { PageHeader } from "@/shared/components/page/PageHeader";
import { SkeletonBlock } from "@/shared/components/skeletons/SkeletonBlock";
import { Table, type TableColumn } from "@/shared/components/table/Table";
import { useTournamentPlayerOfSeriesQuery } from "@/features/tournaments/hooks/useTournamentPlayerOfSeriesQuery";
import { useTournament } from "@/features/tournaments/hooks/useTournament";
import type {
  PlayerOfSeriesRow,
  TournamentPlayerOfSeriesResponse,
} from "@/features/tournaments/types/tournamentAwards.types";

const teamName = (row: PlayerOfSeriesRow) => row.team?.name || "-";

const formatMetric = (value: unknown, digits = 2) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-";

const pointsFormulaItems = (
  scoring: TournamentPlayerOfSeriesResponse["scoring"],
) => [
  { label: "Run", value: scoring.run },
  { label: "Wicket", value: scoring.wicket },
  { label: "4", value: scoring.four },
  { label: "6", value: scoring.six },
  { label: "50 Bonus", value: scoring.fiftyBonus },
  { label: "100 Bonus", value: scoring.hundredBonus },
  { label: "5W Bonus", value: scoring.fiveWicketBonus },
  { label: "Catch", value: scoring.catch },
  { label: "Run Out", value: scoring.runOut },
];

const renderWinnerSpotlight = (winner: PlayerOfSeriesRow) => (
  <Card className="space-y-5 border-outline bg-surface-container p-6 md:p-7">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-display text-sm font-bold uppercase tracking-widest text-on-primary-container">
          Player of the Series
        </p>
        <h2 className="mt-1 font-display text-5xl font-bold leading-none text-on-surface md:text-6xl">
          {winner.name}
        </h2>
        <p className="mt-2 text-xl font-medium text-on-surface-subtle">
          {teamName(winner)}
        </p>
      </div>
      <div className="rounded-2xl border border-primary/20 bg-surface-container-high px-5 py-4 text-center">
        <StatusPill variant="success" size="xs">
          Points
        </StatusPill>
        <p className="mt-2 font-display text-5xl font-extrabold leading-none text-on-primary-container md:text-6xl">
          {winner.points}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 rounded-2xl border border-outline bg-surface-container-high p-4 md:grid-cols-7">
      <div>
        <p className="text-xs text-on-surface-muted">M</p>
        <p className="font-display text-3xl font-bold leading-none text-on-surface">
          {winner.matches}
        </p>
      </div>
      <div>
        <p className="text-xs text-on-surface-muted">Runs</p>
        <p className="font-display text-3xl font-bold leading-none text-on-surface">
          {winner.runs}
        </p>
      </div>
      <div>
        <p className="text-xs text-on-surface-muted">Wkts</p>
        <p className="font-display text-3xl font-bold leading-none text-on-surface">
          {winner.wickets}
        </p>
      </div>
      <div>
        <p className="text-xs text-on-surface-muted">SR</p>
        <p className="font-display text-3xl font-bold leading-none text-on-surface">
          {formatMetric(winner.strikeRate)}
        </p>
      </div>
      <div>
        <p className="text-xs text-on-surface-muted">Econ</p>
        <p className="font-display text-3xl font-bold leading-none text-on-surface">
          {formatMetric(winner.economy)}
        </p>
      </div>
      <div>
        <p className="text-xs text-on-surface-muted">50s/100s/5W</p>
        <p className="font-display text-3xl font-bold leading-none text-on-surface">
          {winner.fifties}/{winner.hundreds}/{winner.fiveWicketHauls}
        </p>
      </div>
      <div>
        <p className="text-xs text-on-surface-muted">Catches/RO</p>
        <p className="font-display text-3xl font-bold leading-none text-on-surface">
          {winner.catches}/{winner.runOuts}
        </p>
      </div>
    </div>
  </Card>
);

const AwardsSkeleton = () => (
  <div className="space-y-4">
    <Card className="space-y-3 p-4">
      <SkeletonBlock className="h-4 w-40 rounded-full" />
      <SkeletonBlock className="h-20 w-full rounded-xl" />
    </Card>
    <Card className="space-y-3 p-4">
      <SkeletonBlock className="h-4 w-48 rounded-full" />
      <SkeletonBlock className="h-44 w-full rounded-xl" />
    </Card>
  </div>
);

export const TournamentAwardsPage = () => {
  const { tournamentId } = useParams({
    from: "/tournaments/$tournamentId/awards",
  });
  const tournamentQuery = useTournament(tournamentId);
  const isTournamentCompleted = tournamentQuery.data?.status === "COMPLETED";
  const awardsQuery = useTournamentPlayerOfSeriesQuery(
    tournamentId,
    isTournamentCompleted,
  );
  const header = (
    <PageHeader
      eyebrow="Tournament"
      title={`${tournamentQuery.data?.name ?? "Tournament"} Awards`}
      description="Automated player of the series ranking."
    />
  );

  if (tournamentQuery.isLoading || awardsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {header}
        <AwardsSkeleton />
      </div>
    );
  }

  if (!isTournamentCompleted) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState
          title="Awards available after completion"
          description="Player of the Series is shown after all matches are completed."
        />
      </div>
    );
  }

  if (awardsQuery.isError) {
    return (
      <div className="space-y-4">
        {header}
        <Card className="space-y-4 p-4">
          <div className="rounded-xl border border-error/40 bg-error-container p-4 text-sm text-on-error-container">
            {awardsQuery.error instanceof Error
              ? awardsQuery.error.message
              : "Unable to load awards."}
          </div>
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            onClick={() => awardsQuery.refetch()}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const awards = awardsQuery.data as
    | TournamentPlayerOfSeriesResponse
    | undefined;

  if (!awards) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState
          title="No awards data yet"
          description="No awards data yet."
        />
      </div>
    );
  }

  if (!awards.winner) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState
          title="No awards data yet"
          description="Player of the Series will appear after matches are played."
        />
      </div>
    );
  }

  const columns: TableColumn<PlayerOfSeriesRow>[] = [
    {
      key: "rank",
      header: "#",
      align: "left",
      className: "w-10",
      render: (row) => row.rank,
    },
    {
      key: "player",
      header: "Player",
      className: "w-56",
      render: (row) => (
        <span className="flex flex-col">
          <span>{row.name || "-"}</span>
          <span className="text-xs text-on-surface-muted">{teamName(row)}</span>
        </span>
      ),
    },
    {
      key: "points",
      header: "Pts",
      align: "right",
      className: "w-12 tabular-nums",
      render: (row) => row.points,
    },
    {
      key: "matches",
      header: "M",
      align: "right",
      className: "w-10 tabular-nums",
      render: (row) => row.matches,
    },
    {
      key: "runs",
      header: "Runs",
      align: "right",
      className: "w-12 tabular-nums",
      render: (row) => row.runs,
    },
    {
      key: "wickets",
      header: "Wkts",
      align: "right",
      className: "w-12 tabular-nums",
      render: (row) => row.wickets,
    },
    {
      key: "strikeRate",
      header: "SR",
      align: "right",
      className: "w-12 tabular-nums",
      render: (row) => formatMetric(row.strikeRate),
    },
    {
      key: "economy",
      header: "Econ",
      align: "right",
      className: "w-12 tabular-nums",
      render: (row) => formatMetric(row.economy),
    },
    {
      key: "fifties",
      header: "50s",
      align: "right",
      className: "w-10 tabular-nums",
      render: (row) => row.fifties,
    },
    {
      key: "hundreds",
      header: "100s",
      align: "right",
      className: "w-10 tabular-nums",
      render: (row) => row.hundreds,
    },
    {
      key: "fiveWicketHauls",
      header: "5W",
      align: "right",
      className: "w-10 tabular-nums",
      render: (row) => row.fiveWicketHauls,
    },
    {
      key: "catches",
      header: "C",
      align: "right",
      className: "w-10 tabular-nums",
      render: (row) => row.catches,
    },
    {
      key: "runOuts",
      header: "RO",
      align: "right",
      className: "w-10 tabular-nums",
      render: (row) => row.runOuts,
    },
  ];

  return (
    <div className="mx-auto w-full space-y-12">
      {header}
      {renderWinnerSpotlight(awards.winner)}

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-on-primary-container">
            Leaderboard
          </h3>
        </div>

        <details className="w-full text-xs text-on-surface-muted " open>
          <summary className="mb-3 cursor-pointer list-none font-semibold text-on-primary-container">
            Points formula
          </summary>
          <div className="mb-8 grid w-full grid-cols-2 gap-2 rounded-xl border border-outline bg-surface-container-high p-3 sm:grid-cols-3 lg:grid-cols-5">
            {pointsFormulaItems(awards.scoring).map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2"
              >
                <p className="text-2xs font-semibold uppercase tracking-wider text-on-surface-muted">
                  {item.label}
                </p>
                <p className="mt-1 font-display text-lg font-bold leading-none text-on-primary-container">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </details>

        <div className="border-t border-outline"></div>

        <Table
          columns={columns}
          rows={awards.leaderboard.slice(0, 10)}
          rowKey={(row, index) => `${row.playerId ?? row.name}-${index}`}
          emptyState={
            <p className="text-sm text-on-surface-muted">No awards data yet</p>
          }
          tableClassName="min-w-0"
        />
      </Card>
    </div>
  );
};
