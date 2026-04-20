import { Card } from "../card/Card";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
};

export const StatCard = ({ label, value, hint, className }: StatCardProps) => (
  <Card className={className}>
    <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
      {label}
    </p>
    <p className="mt-1 text-lg font-semibold text-on-surface">{value}</p>
    {hint ? <p className="mt-1 text-xs text-on-surface-variant">{hint}</p> : null}
  </Card>
);


