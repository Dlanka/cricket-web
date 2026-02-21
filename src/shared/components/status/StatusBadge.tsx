import { STATUS_BADGE_LABELS, STATUS_BADGE_STYLES } from "../../constants/statusColors";
import { classNames } from "../../utils/classNames";

type StatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => (
  <span
    className={classNames(
      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
      STATUS_BADGE_STYLES[status] ?? STATUS_BADGE_STYLES.SCHEDULED,
      className,
    )}
  >
    {label ?? STATUS_BADGE_LABELS[status] ?? status}
  </span>
);
