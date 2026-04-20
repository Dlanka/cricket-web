import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="rounded-2xl border border-outline bg-surface-container p-6 text-center shadow-surface-lg">
    <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
    {description ? <p className="mt-2 text-sm text-on-surface-variant">{description}</p> : null}
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
);

