import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="rounded-2xl border border-neutral-90 bg-neutral-99 p-6 text-center shadow-[0_20px_60px_-50px_rgba(15,23,42,0.4)]">
    <h3 className="text-lg font-semibold text-primary-10">{title}</h3>
    {description ? <p className="mt-2 text-sm text-neutral-40">{description}</p> : null}
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
);
