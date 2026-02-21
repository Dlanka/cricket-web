import { Card } from "../card/Card";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
};

export const StatCard = ({ label, value, hint, className }: StatCardProps) => (
  <Card className={className}>
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-40">
      {label}
    </p>
    <p className="mt-1 text-lg font-semibold text-primary-10">{value}</p>
    {hint ? <p className="mt-1 text-xs text-neutral-40">{hint}</p> : null}
  </Card>
);
