import { Card } from "@/shared/components/card/Card";
import { SectionHeader } from "@/shared/components/page/SectionHeader";
import {
  Table,
  type TableColumn,
} from "@/shared/components/table/Table";
import { TournamentStandingsActions } from "./TournamentStandingsActions";
import type { TournamentStandingsResponse } from "../types/tournamentTypes";

type Props = {
  standings?: TournamentStandingsResponse;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  canRecompute: boolean;
  showGenerate: boolean;
  canGenerate: boolean;
  canViewActions: boolean;
  isRecomputing: boolean;
  isGenerating: boolean;
  onRecompute: () => void;
  onGenerate: () => void;
};

const formatNrr = (value: number) => {
  const fixed = Math.abs(value).toFixed(3);
  if (value > 0) return `+${fixed}`;
  if (value < 0) return `-${fixed}`;
  return "0.000";
};

type StandingRow = TournamentStandingsResponse["items"][number];

const columns: TableColumn<StandingRow>[] = [
  { key: "rank", header: "#", render: (row) => row.rank },
  {
    key: "team",
    header: "Team",
    className: "w-60 font-semibold",
    render: (row) => row.team.name,
  },
  { key: "played", header: "P", align: "right", render: (row) => row.played },
  { key: "won", header: "W", align: "right", render: (row) => row.won },
  { key: "lost", header: "L", align: "right", render: (row) => row.lost },
  { key: "tied", header: "T", align: "right", render: (row) => row.tied },
  {
    key: "noResult",
    header: "NR",
    align: "right",
    render: (row) => row.noResult,
  },
  {
    key: "points",
    header: "Pts",
    align: "right",
    className: "font-semibold",
    render: (row) => row.points,
  },
  {
    key: "nrr",
    header: "NRR",
    align: "right",
    className: "font-medium",
    render: (row) => formatNrr(row.netRunRate),
  },
];

export const TournamentStandingsSection = ({
  standings,
  isLoading,
  isError,
  errorMessage,
  canRecompute,
  showGenerate,
  canGenerate,
  canViewActions,
  isRecomputing,
  isGenerating,
  onRecompute,
  onGenerate,
}: Props) => (
  <Card className="space-y-5 rounded-3xl shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)]">
    <SectionHeader
      eyebrow="Points Table"
      title="League standings"
      subtitle={
        standings
          ? `${standings.completedLeagueMatches} / ${standings.totalLeagueMatches} completed`
          : "League progress unavailable"
      }
      actions={
        canViewActions ? (
          <TournamentStandingsActions
            canRecompute={canRecompute}
            showGenerate={showGenerate}
            canGenerate={canGenerate}
            isRecomputing={isRecomputing}
            isGenerating={isGenerating}
            onRecompute={onRecompute}
            onGenerate={onGenerate}
          />
        ) : null
      }
    />

    <div>
      {isLoading ? (
        <p className="text-sm text-neutral-40">Loading standings...</p>
      ) : null}

      {isError ? (
        <div className="rounded-2xl border border-error-80 bg-error-95 p-4 text-sm text-error-40">
          {errorMessage ?? "Unable to load standings."}
        </div>
      ) : null}

      {!isLoading && !isError && standings && standings.items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-90 bg-neutral-100 p-4 text-sm text-neutral-40">
          No completed league matches yet.
        </div>
      ) : null}

      {!isLoading && !isError && standings && standings.items.length > 0 ? (
        <Table
          columns={columns}
          rows={standings.items}
          rowKey={(row) => row.team.id}
        />
      ) : null}
    </div>
  </Card>
);
