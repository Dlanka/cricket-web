import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => (
  <section
    className={`rounded-2xl border border-outline bg-surface-container p-6 shadow-surface-lg ${className ?? ""}`}
  >
    {children}
  </section>
);

