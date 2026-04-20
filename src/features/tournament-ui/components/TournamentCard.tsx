import type { ReactNode } from "react";
import { classNames } from "@/shared/utils/classNames";

type TournamentCardProps = {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  header?: ReactNode;
};

export const TournamentCard = ({
  children,
  className,
  muted = false,
  header,
}: TournamentCardProps) => (
  <section
    className={classNames(
      "overflow-hidden rounded-xl border border-outline bg-surface-container shadow-surface-lg",
      muted && "border-outline-variant bg-surface-container",
      className,
    )}
  >
    {header ? (
      <div className="border-b border-outline-variant px-5 py-4">{header}</div>
    ) : null}
    <div className="px-5 py-5">{children}</div>
  </section>
);
