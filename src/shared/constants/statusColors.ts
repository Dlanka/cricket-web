export const STATUS_BADGE_STYLES: Record<string, string> = {
  SCHEDULED: "border-warning-80 bg-warning-95 text-warning-30",
  LIVE: "border-success-80 bg-success-95 text-success-30",
  COMPLETED: "border-neutral-80 bg-neutral-95 text-neutral-40",
  TBD: "border-neutral-85 bg-neutral-97 text-neutral-45",
  ACTIVE: "border-success-80 bg-success-95 text-success-30",
  DISABLED: "border-warning-80 bg-warning-95 text-warning-30",
  BLOCKED: "border-error-80 bg-error-95 text-error-30",
};

export const STATUS_BADGE_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  LIVE: "Live",
  COMPLETED: "Completed",
  TBD: "TBD",
  ACTIVE: "Active",
  DISABLED: "Disabled",
  BLOCKED: "Blocked",
};
