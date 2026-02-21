import type { Player } from "../../types/players.types";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import {
  getBattingStyleLabel,
  getBowlingStyleLabel,
} from "@/features/players/constants/playerStyles";

type Props = {
  players: Player[];
  onDelete: (playerId: string) => void;
  isDeleting?: boolean;
  onEdit?: (player: Player) => void;
  canEdit?: boolean;
};

export const PlayersList = ({
  players,
  onDelete,
  isDeleting,
  onEdit,
  canEdit,
}: Props) => (
  <div className="space-y-2">
    {players.map((player) => (
      <div
        key={player.id}
        className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-90 bg-neutral-99 p-4 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.4)]"
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-primary-10">
              {player.fullName}
            </p>
            {player.isWicketKeeper ? (
              <span className="rounded-full border border-secondary-80 bg-secondary-95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary-40">
                WK
              </span>
            ) : null}
          </div>
          <p className="text-xs text-neutral-40">
            {[
              player.jerseyNumber != null ? `#${player.jerseyNumber}` : null,
              getBattingStyleLabel(player.battingStyle),
              getBowlingStyleLabel(player.bowlingStyle),
            ]
              .filter(Boolean)
              .join(" - ") || "Details not provided"}
          </p>
        </div>
        <div className="hidden flex-wrap items-center gap-2 group-hover:flex">
          {canEdit && onEdit ? (
            <Button
              type="button"
              appearance="tonal"
              color="neutral"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={`Edit ${player.fullName}`}
              title={`Edit ${player.fullName}`}
              onClick={() => onEdit(player)}
              shape="square"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          {canEdit ? (
            <Button
              type="button"
              appearance="tonal"
              color="error"
              size="sm"
              shape="square"
              className="h-8 w-8 p-0"
              aria-label={`Remove ${player.fullName}`}
              title={`Remove ${player.fullName}`}
              disabled={isDeleting}
              onClick={() => onDelete(player.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    ))}
  </div>
);
