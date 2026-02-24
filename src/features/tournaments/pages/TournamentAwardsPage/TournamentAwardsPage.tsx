import { useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button/Button";
import { Card } from "@/shared/components/card/Card";
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

const renderWinnerSpotlight = (winner: PlayerOfSeriesRow) => (
  <Card className="space-y-5 border-2 border-primary-80 bg-primary-95/70 p-5 shadow-sm md:p-6">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-30">
          Player of the Series
        </p>
        <h2 className="mt-1 text-2xl font-bold text-primary-10 md:text-3xl">
          {winner.name}
        </h2>
        <p className="text-sm font-medium text-neutral-50 md:text-base">
          {teamName(winner)}
        </p>
      </div>
      <div className="rounded-xl border border-primary-80 bg-white/80 px-4 py-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-30">
          Points
        </p>
        <p className="text-3xl font-extrabold leading-none text-primary-20 md:text-4xl">
          {winner.points}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 rounded-xl border border-primary-90/70 bg-white/80 p-3 text-sm md:grid-cols-6">
      <div>
        <p className="text-xs text-neutral-40">M</p>
        <p className="font-semibold text-primary-10">{winner.matches}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-40">Runs</p>
        <p className="font-semibold text-primary-10">{winner.runs}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-40">Wkts</p>
        <p className="font-semibold text-primary-10">{winner.wickets}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-40">SR</p>
        <p className="font-semibold text-primary-10">
          {formatMetric(winner.strikeRate)}
        </p>
      </div>
      <div>
        <p className="text-xs text-neutral-40">Econ</p>
        <p className="font-semibold text-primary-10">
          {formatMetric(winner.economy)}
        </p>
      </div>
      <div>
        <p className="text-xs text-neutral-40">50s/100s/5W</p>
        <p className="font-semibold text-primary-10">
          {winner.fifties}/{winner.hundreds}/{winner.fiveWicketHauls}
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
          <div className="rounded-xl border border-error-80 bg-error-95 p-4 text-sm text-error-40">
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
          <span className="text-xs text-neutral-40">{teamName(row)}</span>
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
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      {header}
      {renderWinnerSpotlight(awards.winner)}

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-20">
            Leaderboard
          </h3>
          <details className="text-xs text-neutral-40">
            <summary className="cursor-pointer list-none font-semibold text-primary-20">
              Points formula
            </summary>
            <p className="mt-2 text-right">
              Run: {awards.scoring.run}, Wicket: {awards.scoring.wicket}, 4:{" "}
              {awards.scoring.four}, 6: {awards.scoring.six}, 50 bonus:{" "}
              {awards.scoring.fiftyBonus}, 100 bonus:{" "}
              {awards.scoring.hundredBonus}, 5W bonus:{" "}
              {awards.scoring.fiveWicketBonus}
            </p>
          </details>
        </div>

        <Table
          columns={columns}
          rows={awards.leaderboard.slice(0, 10)}
          rowKey={(row, index) => `${row.playerId ?? row.name}-${index}`}
          emptyState={
            <p className="text-sm text-neutral-40">No awards data yet</p>
          }
          tableClassName="min-w-0"
        />
      </Card>
    </div>
  );
};
