import { Button, ButtonLink } from "@/components/ui/button/Button";
import { formatDate } from "@/shared/utils/date";
import type { Team } from "../../types/teams.types";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Reorder } from "framer-motion";

type Props = {
  teams: Team[];
  tournamentId: string;
  onEdit?: (team: Team) => void;
  onAccessLinks?: (team: Team) => void;
  onDelete?: (team: Team) => void;
  canReorder?: boolean;
  onReorder?: (teams: Team[]) => void;
  onReorderEnd?: () => void;
  deletingTeamId?: string | null;
  canEdit?: boolean;
};

type TeamRowProps = {
  team: Team;
  tournamentId: string;
  onEdit?: (team: Team) => void;
  onAccessLinks?: (team: Team) => void;
  onDelete?: (team: Team) => void;
  deletingTeamId?: string | null;
  canEdit?: boolean;
  canReorder?: boolean;
};

const TeamRow = ({
  team,
  tournamentId,
  onEdit,
  onAccessLinks,
  onDelete,
  deletingTeamId,
  canEdit,
  canReorder,
}: TeamRowProps) => {
  return (
    <div className="bg-surface-container flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline px-4 py-4 transition hover:border-outline-strong">
      <div className="flex items-center gap-3">
        {canReorder ? (
          <span className="text-on-surface-subtle">
            <GripVertical className="h-4 w-4" />
          </span>
        ) : null}
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
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
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
        {canEdit && onEdit ? (
          <Button
            type="button"
            appearance="soft"
            color="neutral"
            size="xs"
            icon={<Pencil className="h-3.5 w-3.5" />}
            aria-label={`Edit ${team.name}`}
            title={`Edit ${team.name}`}
            onClick={() => onEdit(team)}
          />
        ) : null}
        {canEdit && onDelete ? (
          <Button
            type="button"
            appearance="soft"
            color="error"
            size="xs"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            aria-label={`Delete ${team.name}`}
            title={`Delete ${team.name}`}
            disabled={deletingTeamId === team.id}
            onClick={() => onDelete(team)}
          />
        ) : null}
      </div>
    </div>
  );
};

export const TeamsList = ({
  teams,
  tournamentId,
  onEdit,
  onAccessLinks,
  onDelete,
  canReorder,
  onReorder,
  onReorderEnd,
  deletingTeamId,
  canEdit,
}: Props) => {
  if (canReorder && onReorder) {
    return (
      <Reorder.Group
        axis="y"
        values={teams}
        onReorder={onReorder}
        className="grid gap-2"
      >
        {teams.map((team) => {
          return (
            <Reorder.Item
              key={team.id}
              value={team}
              onDragEnd={onReorderEnd}
              className="list-none cursor-grab active:cursor-grabbing"
            >
              <TeamRow
                team={team}
                tournamentId={tournamentId}
                onEdit={onEdit}
                onAccessLinks={onAccessLinks}
                onDelete={onDelete}
                deletingTeamId={deletingTeamId}
                canEdit={canEdit}
                canReorder
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    );
  }

  return (
    <div className="grid gap-2">
      {teams.map((team) => (
        <TeamRow
          key={team.id}
          team={team}
          tournamentId={tournamentId}
          onEdit={onEdit}
          onAccessLinks={onAccessLinks}
          onDelete={onDelete}
          deletingTeamId={deletingTeamId}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
};
