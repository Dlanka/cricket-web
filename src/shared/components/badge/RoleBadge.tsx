import { tv } from "tailwind-variants";

export type RoleBadgeRole = "ADMIN" | "SCORER" | "VIEWER";

type RoleBadgeProps = {
  role: RoleBadgeRole;
  className?: string;
};

const roleBadgeStyles = tv({
  base: "inline-flex items-center rounded-md border border-primary-40 bg-primary-40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-98",
});

export const RoleBadge = ({ role, className }: RoleBadgeProps) => (
  <span className={roleBadgeStyles({ className })}>{role}</span>
);
