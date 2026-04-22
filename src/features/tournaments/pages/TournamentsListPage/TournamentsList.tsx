import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button/Button";
import { formatDateRange } from "@/shared/utils/date";
import { StatusBadge } from "@/shared/components/status/StatusBadge";
import type { TournamentSummary } from "../../types/tournamentTypes";

type Props = {
  tournaments: TournamentSummary[];
  canManage?: boolean;
  onDelete?: (tournament: TournamentSummary) => void;
  onDuplicate?: (tournament: TournamentSummary) => void;
};

export const TournamentsList = ({
  tournaments,
  canManage = false,
  onDelete,
  onDuplicate,
}: Props) => (
  <section className="grid gap-4">
    {tournaments.map((tournament) => (
      <div
        key={tournament.id}
        className="group relative rounded-2xl border border-outline bg-surface-container p-6 text-left text-on-surface shadow-surface-lg transition hover:-translate-y-0.5 hover:border-outline-strong hover:text-on-surface"
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
                <p className="mt-1 text-xs uppercase tracking-widest text-on-surface-muted">
                  {tournament.location}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={tournament.status} />

              {canManage && onDuplicate ? (
                <Button
                  type="button"
                  appearance="outline"
                  color="neutral"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onDuplicate(tournament);
                  }}
                >
                  Duplicate
                </Button>
              ) : null}

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
          <p className="mt-3 text-sm text-on-surface-muted">
            {formatDateRange(tournament.startDate, tournament.endDate)}
          </p>
        </Link>
      </div>
    ))}
  </section>
);



