import type { TournamentStatus } from "@/features/tournaments/types/tournamentTypes";
import { StatusPill } from "@/shared/components/badge/StatusPill";

type TournamentStatusPillProps = {
  status: TournamentStatus;
  className?: string;
};

const statusVariantMap: Record<TournamentStatus, "warning" | "info" | "danger"> = {
  DRAFT: "warning",
  ACTIVE: "info",
  COMPLETED: "danger",
};

export const TournamentStatusPill = ({
  status,
  className,
}: TournamentStatusPillProps) => (
  <StatusPill variant={statusVariantMap[status]} size="sm" className={className}>
    {status}
  </StatusPill>
);

