import type { ReactNode } from "react";
import { classNames } from "@/shared/utils/classNames";

type TournamentStatTileProps = {
  label: string;
  value: ReactNode;
  className?: string;
  mono?: boolean;
};

export const TournamentStatTile = ({
  label,
  value,
  className,
  mono = false,
}: TournamentStatTileProps) => (
  <article
    className={classNames(
      "bg-surface-container-high rounded-lg border border-outline-variant px-4 py-3",
      className,
    )}
  >
    <p className="font-display text-2xs font-bold tracking-wider uppercase text-on-surface-subtle">
      {label}
    </p>
    <p
      className={classNames(
        "font-display mt-1 text-lg font-bold text-on-surface",
        mono && "font-mono",
      )}
    >
      {value}
    </p>
  </article>
);
