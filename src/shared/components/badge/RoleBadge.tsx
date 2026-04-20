import { tv } from "tailwind-variants";

export type RoleBadgeRole = "ADMIN" | "SCORER" | "VIEWER";

type RoleBadgeProps = {
  role: RoleBadgeRole;
  className?: string;
};

const roleBadgeStyles = tv({
  base: "inline-flex items-center rounded-md border border-primary/25 bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-on-primary",
});

export const RoleBadge = ({ role, className }: RoleBadgeProps) => (
  <span className={roleBadgeStyles({ className })}>{role}</span>
);



