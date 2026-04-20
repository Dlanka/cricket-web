import { Button, ButtonLink } from "@/components/ui/button/Button";
import { formatDate } from "@/shared/utils/date";
import type { Team } from "../../types/teams.types";

type Props = {
  teams: Team[];
  tournamentId: string;
  onEdit?: (team: Team) => void;
  onAccessLinks?: (team: Team) => void;
  canEdit?: boolean;
};

export const TeamsList = ({
  teams,
  tournamentId,
  onEdit,
  onAccessLinks,
  canEdit,
}: Props) => (
  <div className="grid gap-2">
    {teams.map((team) => (
      <div
        key={team.id}
        className="bg-surface-container flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline px-4 py-4 transition hover:border-outline-strong"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg border border-primary/35 bg-primary-container text-sm font-bold text-on-primary-container font-display">
            {(team.shortName ?? team.name).slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-on-surface font-display">
              {team.name}
            </p>
            <div className="mt-0.5 text-xs text-on-surface-subtle">
              {(team.shortName ?? "N/A").toUpperCase()} | Created{" "}
              {formatDate(team.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && onAccessLinks ? (
            <Button
              type="button"
              appearance="soft"
              color="neutral"
              size="xs"
              uppercase
              onClick={() => onAccessLinks(team)}
            >
              Access link
            </Button>
          ) : null}
          {canEdit && onEdit ? (
            <Button
              type="button"
              appearance="soft"
              color="neutral"
              size="xs"
              uppercase
              onClick={() => onEdit(team)}
            >
              Edit
            </Button>
          ) : null}
          <ButtonLink
            to="/tournaments/$tournamentId/teams/$teamId/players"
            params={{ tournamentId, teamId: team.id }}
            appearance="soft"
            color="secondary"
            size="xs"
            shape="square"
            uppercase
          >
            Players
          </ButtonLink>
        </div>
      </div>
    ))}
  </div>
);
