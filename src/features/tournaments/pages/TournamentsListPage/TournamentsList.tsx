import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button/Button";
import { formatDateRange } from "@/shared/utils/date";
import { StatusBadge } from "@/shared/components/status/StatusBadge";
import type { TournamentSummary } from "../../types/tournamentTypes";

type Props = {
  tournaments: TournamentSummary[];
  canManage?: boolean;
  onDelete?: (tournament: TournamentSummary) => void;
};

export const TournamentsList = ({
  tournaments,
  canManage = false,
  onDelete,
}: Props) => (
  <section className="grid gap-4">
    {tournaments.map((tournament) => (
      <div
        key={tournament.id}
        className="group relative rounded-2xl border border-neutral-90 bg-neutral-99 p-6 text-left text-primary-10 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-neutral-80 hover:text-primary-10"
      >
        <Link
          to="/tournaments/$tournamentId"
          params={{ tournamentId: tournament.id }}
          className="block "
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{tournament.name}</p>
              {tournament.location ? (
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-neutral-40">
                  {tournament.location}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={tournament.status} />

              {canManage && onDelete ? (
                <Button
                  type="button"
                  appearance="outline"
                  color="error"
                  size="sm"
                  shape="square"
                  iconName="Trash2"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onDelete(tournament);
                  }}
                  aria-label={`Delete ${tournament.name}`}
                  title="Delete tournament"
                />
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-sm text-neutral-40">
            {formatDateRange(tournament.startDate, tournament.endDate)}
          </p>
        </Link>
      </div>
    ))}
  </section>
);
