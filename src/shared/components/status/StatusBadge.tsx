import { STATUS_BADGE_LABELS } from "../../constants/statusColors";
import {
  StatusPill,
  type StatusPillVariant,
} from "@/shared/components/badge/StatusPill";

type StatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

const statusVariantMap: Record<string, StatusPillVariant> = {
  SCHEDULED: "warning",
  LIVE: "info",
  COMPLETED: "success",
  TBD: "neutral",
  ACTIVE: "info",
  DISABLED: "warning",
  BLOCKED: "danger",
  DRAFT: "warning",
  PENDING: "neutral",
};

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => (
  <StatusPill
    variant={statusVariantMap[status] ?? "neutral"}
    size="xs"
    className={className}
  >
    {label ?? STATUS_BADGE_LABELS[status] ?? status}
  </StatusPill>
);
