import { tv, type VariantProps } from "tailwind-variants";
import { classNames } from "@/shared/utils/classNames";

const badgePillStyles = tv({
  base: "inline-flex items-center rounded-full border px-2 py-px text-[10px] font-semibold uppercase tracking-[0.08em]",
  variants: {
    tone: {
      primary: "border-primary-80 bg-primary-95 text-primary-20",
      neutral: "border-neutral-85 bg-neutral-97 text-neutral-45",
      success: "border-success-80 bg-success-95 text-success-30",
      warning: "border-warning-80 bg-warning-95 text-warning-30",
      error: "border-error-80 bg-error-95 text-error-30",
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
