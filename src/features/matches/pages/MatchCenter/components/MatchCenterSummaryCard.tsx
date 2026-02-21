import { Card } from "@/shared/components/card/Card";
import { formatMatchStatus } from "../hooks/useMatchCenterPage";

type Props = {
  stage: string;
  status: string;
};

export const MatchCenterSummaryCard = ({ stage, status }: Props) => (
  <Card>
    <div className="grid gap-4 text-sm text-neutral-40 md:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.2em]">Stage</p>
        <p className="mt-1 text-base font-semibold text-primary-10">{stage}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em]">Status</p>
        <p className="mt-1 text-base font-semibold text-primary-10">{formatMatchStatus(status)}</p>
      </div>
    </div>
  </Card>
);
