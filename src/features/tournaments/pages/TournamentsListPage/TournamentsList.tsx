import { Link } from "@tanstack/react-router";
import { formatDateRange } from "@/shared/utils/date";
import type { TournamentSummary } from "../../types/tournamentTypes";

type Props = {
  tournaments: TournamentSummary[];
};

export const TournamentsList = ({ tournaments }: Props) => (
  <section className="grid gap-4">
    {tournaments.map((tournament) => (
      <Link
        key={tournament.id}
        to="/tournaments/$tournamentId"
        params={{ tournamentId: tournament.id }}
        className="group rounded-2xl border border-neutral-90 bg-neutral-99 p-6 text-left text-primary-10 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:border-neutral-80 hover:text-primary-10"
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
          <span className="rounded-full border border-neutral-90 px-3 py-1 text-xs font-semibold text-neutral-40">
            {tournament.status}
          </span>
        </div>
        <p className="mt-3 text-sm text-neutral-40">
          {formatDateRange(tournament.startDate, tournament.endDate)}
        </p>
      </Link>
    ))}
  </section>
);
