import type { Player } from "@/features/players/types/players.types";

type Props = {
  players: Player[];
  selectedIds: string[];
  captainId?: string;
  keeperId?: string;
  onToggle: (playerId: string) => void;
  canEdit: boolean;
};

export const PlayerPickList = ({
  players,
  selectedIds,
  captainId,
  keeperId,
  onToggle,
  canEdit,
}: Props) => (
  <div className="grid gap-2 md:grid-cols-3">
    {players.map((player) => {
      const isSelected = selectedIds.includes(player.id);
      return (
        <label
          key={player.id}
          className="flex h-full items-center justify-between rounded-2xl border border-outline bg-surface-container px-4 py-3 text-sm text-on-surface"
        >
          <div>
            <p className="flex items-center gap-2 font-semibold">
              <span>{player.fullName}</span>
              <span className="text-xs text-on-surface-variant">
                {player.jerseyNumber != null ? `#${player.jerseyNumber}` : "--"}
              </span>
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-on-surface-variant">
              {captainId === player.id ? (
                <span className="rounded-full border border-primary/30 bg-primary-container px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-on-primary-container">
                  Captain
                </span>
              ) : null}
              {keeperId === player.id ? (
                <span className="rounded-full border border-warning/30 bg-warning-container px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-on-warning-container">
                  Keeper
                </span>
              ) : null}
            </div>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary-40"
            checked={isSelected}
            onChange={() => onToggle(player.id)}
            disabled={!canEdit}
          />
        </label>
      );
    })}
  </div>
);



