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
    <div className="grid gap-4 text-sm text-neutral-40 md:grid-cols-3">
      <div>
        <p className="text-xs uppercase tracking-[0.2em]">Stage</p>
        <p className="mt-1 text-base font-semibold text-primary-10">{stage}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em]">Status</p>
        <p className="mt-1 text-base font-semibold text-primary-10">{formatMatchStatus(status)}</p>
      </div>
      {phase === "SUPER_OVER" || hasSuperOver ? (
        <div>
          <p className="text-xs uppercase tracking-[0.2em]">Super Over</p>
          <p className="mt-1 text-base font-semibold text-primary-10">
            {superOverStatus ?? "PENDING"}
          </p>
        </div>
      ) : null}
    </div>
  </Card>
);
