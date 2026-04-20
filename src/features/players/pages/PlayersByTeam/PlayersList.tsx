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
  <div className="grid gap-2">
    {players.map((player, index) => (
      <div
        key={player.id}
        className="surface-muted flex items-center justify-between gap-3 rounded-xl border border-outline px-4 py-3 transition hover:border-outline-strong"
      >
        <div className="flex items-center gap-3">
          <p className="w-9 text-right text-xs text-on-surface-subtle font-mono">
            {player.jerseyNumber != null ? `#${player.jerseyNumber}` : `#${index + 1}`}
          </p>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-on-surface">
                {player.fullName}
              </p>
              {player.isWicketKeeper ? (
                <span className="rounded-full border border-warning/35 bg-warning-container px-2 py-0.5 text-xs font-bold tracking-wide uppercase text-on-warning-container font-display">
                  WK
                </span>
              ) : null}
            </div>
            <p className="text-xs text-on-surface-subtle">
              {[
                getBattingStyleLabel(player.battingStyle),
                getBowlingStyleLabel(player.bowlingStyle),
              ]
                .filter(Boolean)
                .join(" | ") || "Details not provided"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && onEdit ? (
            <Button
              type="button"
              appearance="soft"
              color="neutral"
              size="xs"
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
              appearance="outline"
              color="error"
              size="xs"
              shape="square"
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

