import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button/Button";
import { formatDate } from "@/shared/utils/date";
import type { Team } from "../../types/teams.types";

type Props = {
  teams: Team[];
  tournamentId: string;
  onEdit?: (team: Team) => void;
  canEdit?: boolean;
};

export const TeamsList = ({ teams, tournamentId, onEdit, canEdit }: Props) => (
  <div className="space-y-4">
    {teams.map((team) => (
      <div
        key={team.id}
        className="group relative overflow-hidden rounded-3xl border border-neutral-90 bg-neutral-99 p-5 text-primary-10 shadow-[0_24px_70px_-60px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:border-neutral-80"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary-80 via-secondary-80 to-info-80 opacity-60" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">{team.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-40">
              <span className="rounded-full border border-neutral-90 bg-neutral-99 px-3 py-1 font-semibold uppercase tracking-[0.2em]">
                {team.shortName ?? "N/A"}
              </span>
              <span className="rounded-full border border-neutral-90 bg-neutral-99 px-3 py-1">
                Created {formatDate(team.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && onEdit ? (
              <Button
                type="button"
                appearance="outline"
                color="neutral"
                size="sm"
                onClick={() => onEdit(team)}
              >
                Edit
              </Button>
            ) : null}
            <Link
              to="/tournaments/$tournamentId/teams/$teamId/players"
              params={{ tournamentId, teamId: team.id }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-90 px-4 py-2 text-sm font-semibold text-primary-20 transition hover:border-neutral-80 hover:text-primary-10"
            >
              Players
            </Link>
          </div>
        </div>
      </div>
    ))}
  </div>
);
