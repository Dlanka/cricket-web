import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => (
  <section
    className={`rounded-2xl border border-neutral-90 bg-neutral-99 p-6 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.4)] ${className ?? ""}`}
  >
    {children}
  </section>
);
