import type { Player } from "../../types/players.types";
import { Check, Pencil, Trash2 } from "lucide-react";
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
  onToggleDefaultSquad?: (player: Player) => void;
  isTogglingDefault?: boolean;
};

export const PlayersList = ({
  players,
  onDelete,
  isDeleting,
  onEdit,
  canEdit,
  onToggleDefaultSquad,
  isTogglingDefault,
}: Props) => {
  const selectedCount = players.filter((player) => player.defaultInSquad).length;
  const isAllSelected = players.length > 0 && selectedCount === players.length;

  const handleToggleAll = () => {
    if (!canEdit || !onToggleDefaultSquad || isTogglingDefault) {
      return;
    }
    players.forEach((player) => {
      const shouldToggle = isAllSelected
        ? player.defaultInSquad
        : !player.defaultInSquad;
      if (shouldToggle) {
        onToggleDefaultSquad(player);
      }
    });
  };

  return (
  <div className="grid gap-2">
    <div className="flex items-center justify-end gap-3 text-xs font-medium">
      <button
        type="button"
        className="text-on-surface-variant underline underline-offset-2 transition hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleToggleAll}
        disabled={!canEdit || !onToggleDefaultSquad || isTogglingDefault || players.length === 0}
      >
        {isAllSelected ? "Unselect all" : "Select all"}
      </button>
      <p className="text-on-surface-variant">
        Selected: {selectedCount}/{players.length}
      </p>
    </div>
    {players.map((player, index) => (
      <div
        key={player.id}
        role={canEdit && onToggleDefaultSquad ? "button" : undefined}
        tabIndex={canEdit && onToggleDefaultSquad ? 0 : undefined}
        onClick={
          canEdit && onToggleDefaultSquad
            ? () => onToggleDefaultSquad(player)
            : undefined
        }
        onKeyDown={
          canEdit && onToggleDefaultSquad
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggleDefaultSquad(player);
                }
              }
            : undefined
        }
        className={`bg-surface-container border-outline hover:border-outline-strong flex items-center justify-between gap-3 rounded-xl border px-4 py-4 transition 
         ${
           canEdit && onToggleDefaultSquad
             ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
             : ""
         }`}
      >
        <div className="flex items-center gap-3">
          <div className="mr-3 flex w-10 items-center justify-center">
            {player.defaultInSquad ? (
              <span className="text-success flex items-center justify-center">
                <Check className="h-5 w-5" strokeWidth={2} />
              </span>
            ) : (
              <p className="text-right text-lg font-semibold text-on-surface-muted font-display">
                {player.jerseyNumber != null
                  ? `#${player.jerseyNumber}`
                  : `#${index + 1}`}
              </p>
            )}
          </div>
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
            <p className={`text-xs text-on-surface-subtle `}>
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
              disabled={isTogglingDefault}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(player);
              }}
              onKeyDown={(event) => event.stopPropagation()}
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
              disabled={isDeleting || isTogglingDefault}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(player.id);
              }}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    ))}
  </div>
  );
};
