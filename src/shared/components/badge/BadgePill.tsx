import { tv, type VariantProps } from "tailwind-variants";
import { classNames } from "@/shared/utils/classNames";

const badgePillStyles = tv({
  base: "inline-flex items-center rounded-full border px-2 py-px text-[10px] font-semibold uppercase tracking-[0.08em]",
  variants: {
    tone: {
      primary: "border-primary/25 bg-primary-container text-on-primary-container",
      neutral: "border-outline bg-surface-container text-on-surface-variant",
      success: "border-success/25 bg-success-container text-on-success-container",
      warning: "border-warning/25 bg-warning-container text-on-warning-container",
      error: "border-error/25 bg-error-container text-on-error-container",
    },
  },
  defaultVariants: {
    tone: "primary",
  },
});

type BadgePillProps = VariantProps<typeof badgePillStyles> & {
  label: string;
  className?: string;
};

export const BadgePill = ({ label, tone, className }: BadgePillProps) => (
  <span className={classNames(badgePillStyles({ tone }), className)}>{label}</span>
);


