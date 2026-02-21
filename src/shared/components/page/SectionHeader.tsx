import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  actions,
}: SectionHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-1 text-lg font-semibold text-primary-10">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-neutral-40">{subtitle}</p> : null}
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </div>
);
