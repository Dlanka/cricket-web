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
          className="flex h-full items-center justify-between rounded-2xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10"
        >
          <div>
            <p className="flex items-center gap-2 font-semibold">
              <span>{player.fullName}</span>
              <span className="text-xs text-neutral-40">
                {player.jerseyNumber != null ? `#${player.jerseyNumber}` : "--"}
              </span>
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-40">
              {captainId === player.id ? (
                <span className="rounded-full border border-primary-90 bg-primary-95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-20">
                  Captain
                </span>
              ) : null}
              {keeperId === player.id ? (
                <span className="rounded-full border border-secondary-90 bg-secondary-95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary-20">
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
