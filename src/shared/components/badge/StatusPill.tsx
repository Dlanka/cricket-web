import type { ReactNode } from "react";
import { classNames } from "@/shared/utils/classNames";

export type StatusPillVariant =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export type StatusPillSize = "sm" | "xs";

type StatusPillProps = {
  children: ReactNode;
  variant?: StatusPillVariant;
  size?: StatusPillSize;
  className?: string;
};

const variantClassMap: Record<StatusPillVariant, string> = {
  info: "border-primary/35 bg-primary-container text-on-primary-container",
  success: "border-success/35 bg-success-container text-on-success-container",
  warning: "border-warning/35 bg-warning-container text-on-warning-container",
  danger: "border-error/35 bg-error-container text-on-error-container",
  neutral: "border-outline bg-surface-container-high text-on-surface-muted",
};

const sizeClassMap: Record<StatusPillSize, string> = {
  sm: "px-3 py-1 text-2xs tracking-widest",
  xs: "px-2 py-0.5 text-xs tracking-wider",
};

export const StatusPill = ({
  children,
  variant = "neutral",
  size = "sm",
  className,
}: StatusPillProps) => (
  <span
    className={classNames(
      "inline-flex items-center rounded-full border font-display font-bold uppercase",
      variantClassMap[variant],
      sizeClassMap[size],
      className,
    )}
  >
    {children}
  </span>
);

