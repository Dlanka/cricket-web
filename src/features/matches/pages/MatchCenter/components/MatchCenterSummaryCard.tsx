import { Card } from "@/shared/components/card/Card";
import { formatMatchStatus } from "../hooks/useMatchCenterPage";

type Props = {
  stage: string;
  status: string;
  phase?: "REGULAR" | "SUPER_OVER";
  hasSuperOver?: boolean;
  superOverStatus?: "PENDING" | "LIVE" | "COMPLETED" | null;
};

export const MatchCenterSummaryCard = ({
  stage,
  status,
  phase,
  hasSuperOver,
  superOverStatus,
}: Props) => (
  <Card>
    <div className="grid gap-4 text-sm text-on-surface-muted md:grid-cols-3">
      <div>
        <p className="text-xs uppercase tracking-widest">Stage</p>
        <p className="mt-1 text-base font-semibold text-on-surface">{stage}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest">Status</p>
        <p className="mt-1 text-base font-semibold text-on-surface">{formatMatchStatus(status)}</p>
      </div>
      {phase === "SUPER_OVER" || hasSuperOver ? (
        <div>
          <p className="text-xs uppercase tracking-widest">Super Over</p>
          <p className="mt-1 text-base font-semibold text-on-surface">
            {superOverStatus ?? "PENDING"}
          </p>
        </div>
      ) : null}
    </div>
  </Card>
);


