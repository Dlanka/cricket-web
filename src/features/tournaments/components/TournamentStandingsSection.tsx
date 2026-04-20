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
  qualificationSlots?: number;
  onRecompute: () => void;
  onGenerate: () => void;
};

const formatNrr = (value: number) => {
  const fixed = Math.abs(value).toFixed(3);
  if (value > 0) return `+${fixed}`;
  if (value < 0) return `-${fixed}`;
  return "0.000";
};

const getBadgeTone = (shortName?: string | null) => {
  const code = (shortName ?? "").trim().toUpperCase();
  if (code === "CR") return "border-secondary/35 bg-secondary-container text-on-secondary-container";
  if (code === "RR") return "border-success/35 bg-success-container text-on-success-container";
  if (code === "SR") return "border-warning/35 bg-warning-container text-on-warning-container";
  return "border-primary/35 bg-primary-container text-on-primary-container";
};

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
  qualificationSlots = 2,
  onRecompute,
  onGenerate,
}: Props) => {
  const rows = standings?.items ?? [];
  const completed = standings?.completedLeagueMatches ?? 0;
  const total = standings?.totalLeagueMatches ?? 0;
  const slots = Math.max(1, qualificationSlots);
  const qualifiedCount = Math.min(slots, rows.length || slots);

  return (
    <section className="space-y-3">
      <p className="font-display text-2xs font-bold tracking-widest uppercase text-on-surface-subtle">
        Points table
      </p>

      <div className="overflow-hidden rounded-2xl border border-outline bg-surface-container shadow-surface-lg">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant px-5 py-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-on-surface">
              League standings
            </h3>
            <p className="mt-1 text-sm text-on-surface-muted">
              {completed} / {total} completed
            </p>
          </div>
          {canViewActions ? (
            <div className="flex items-center gap-2">
              <TournamentStandingsActions
                canRecompute={canRecompute}
                showGenerate={showGenerate}
                canGenerate={canGenerate}
                isRecomputing={isRecomputing}
                isGenerating={isGenerating}
                onRecompute={onRecompute}
                onGenerate={onGenerate}
              />
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="px-5 py-4 text-sm text-on-surface-muted">
            Loading standings...
          </div>
        ) : null}

        {isError ? (
          <div className="px-5 py-4">
            <div className="rounded-xl border border-error/40 bg-error-container p-3 text-sm text-on-error-container">
              {errorMessage ?? "Unable to load standings."}
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && rows.length === 0 ? (
          <div className="px-5 py-4">
            <div className="rounded-xl border border-outline bg-surface-container-high p-3 text-sm text-on-surface-muted">
              No completed league matches yet.
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 table-fixed">
              <colgroup>
                <col className="w-2" />
                <col className="w-12" />
                <col className="w-auto" />
                <col className="w-12" />
                <col className="w-12" />
                <col className="w-12" />
                <col className="w-12" />
                <col className="w-12" />
                <col className="w-14" />
                <col className="w-20" />
              </colgroup>
              <thead>
                <tr className="border-b border-outline-variant text-2xs uppercase tracking-widest text-on-surface-subtle">
                  <th className="w-2" />
                  <th className="px-2 py-3 text-left">#</th>
                  <th className="px-3 py-3 text-left">Team</th>
                  <th className="px-2 py-3 text-right">P</th>
                  <th className="px-2 py-3 text-right">W</th>
                  <th className="px-2 py-3 text-right">L</th>
                  <th className="px-2 py-3 text-right">T</th>
                  <th className="px-2 py-3 text-right">NR</th>
                  <th className="px-2 py-3 text-right">Pts</th>
                  <th className="px-3 py-3 text-right">NRR</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const qualify = index < qualifiedCount;
                  const initials = (row.team.shortName ?? row.team.name)
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <tr
                      key={row.team.id}
                      className="border-b border-outline-variant text-sm text-on-surface"
                    >
                      <td className="px-0">
                        {qualify ? (
                          <span className="mx-auto block h-14 w-1 rounded-full bg-primary" />
                        ) : null}
                      </td>
                      <td className="px-2 py-4 text-on-primary-container">{row.rank}</td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-2 font-display text-2xs font-bold tracking-wide uppercase ${getBadgeTone(row.team.shortName)}`}
                          >
                            {initials}
                          </span>
                          <span className="font-semibold text-on-surface">
                            {row.team.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-right font-mono text-on-primary-container">{row.played}</td>
                      <td className="px-2 py-4 text-right font-mono text-on-primary-container">{row.won}</td>
                      <td className="px-2 py-4 text-right font-mono text-on-primary-container">{row.lost}</td>
                      <td className="px-2 py-4 text-right font-mono text-on-primary-container">{row.tied}</td>
                      <td className="px-2 py-4 text-right font-mono text-on-primary-container">{row.noResult}</td>
                      <td className="px-2 py-4 text-right font-display text-base font-bold text-on-surface">{row.points}</td>
                      <td className="px-3 py-4 text-right font-mono text-on-surface-muted">
                        {formatNrr(row.netRunRate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && !isError && rows.length > 0 && showGenerate ? (
          <div className="border-t border-outline-variant bg-surface-container-high px-5 py-3 text-sm text-on-surface-muted">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-primary align-middle" />
            Top {qualifiedCount} {qualifiedCount === 1 ? "team" : "teams"} qualify for the knockout stage
          </div>
        ) : null}
      </div>
    </section>
  );
};
