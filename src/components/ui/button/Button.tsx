import { tv, type VariantProps } from "tailwind-variants";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";

const buttonStyles = tv({
  base: "font-display inline-flex cursor-pointer items-center justify-center gap-2 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-70",
  variants: {
    shape: {
      square: "rounded-lg",
      rounded: "rounded-full",
    },
    appearance: {
      filled: "shadow-lg transition hover:-translate-y-0.5",
      tonal: "shadow-sm",
      soft: "border",
      outline: "border",
      standard: "bg-transparent",
    },
    color: {
      primary: "",
      secondary: "",
      success: "",
      warning: "",
      neutral: "",
      error: "",
    },
    size: {
      xs: "px-3 py-1.5 text-xs",
      sm: "px-4 py-2",
      md: "px-5 py-2",
      lg: "px-6 py-3",
      full: "w-full px-6 py-3",
    },
    uppercase: {
      true: "uppercase tracking-wide",
      false: "",
    },
    iconOnly: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      appearance: "filled",
      color: "primary",
      className:
        "bg-primary text-on-primary shadow-primary/25 hover:shadow-primary/40",
    },
    {
      appearance: "filled",
      color: "secondary",
      className:
        "bg-secondary text-on-secondary shadow-secondary/25 hover:shadow-secondary/40",
    },
    {
      appearance: "filled",
      color: "neutral",
      className:
        "bg-surface-container-high text-on-surface shadow-black/20 hover:shadow-black/35",
    },
    {
      appearance: "filled",
      color: "error",
      className: "bg-error text-on-error shadow-error/25 hover:shadow-error/40",
    },
    {
      appearance: "filled",
      color: "success",
      className:
        "bg-success text-on-success shadow-success/25 hover:shadow-success/40",
    },
    {
      appearance: "filled",
      color: "warning",
      className:
        "bg-warning text-on-warning shadow-warning/25 hover:shadow-warning/40",
    },
    {
      appearance: "tonal",
      color: "primary",
      className: "bg-primary-container text-on-primary-container",
    },
    {
      appearance: "tonal",
      color: "secondary",
      className: "bg-secondary-container text-on-secondary-container",
    },
    {
      appearance: "tonal",
      color: "neutral",
      className: "bg-surface-container-high text-on-surface",
    },
    {
      appearance: "tonal",
      color: "error",
      className: "bg-error-container text-on-error-container",
    },
    {
      appearance: "tonal",
      color: "success",
      className: "bg-success-container text-on-success-container",
    },
    {
      appearance: "tonal",
      color: "warning",
      className: "bg-warning-container text-on-warning-container",
    },
    {
      appearance: "soft",
      color: "primary",
      className:
        "border-primary/35 bg-primary-container text-on-primary-container hover:border-primary/50",
    },
    {
      appearance: "soft",
      color: "success",
      className:
        "border-success/35 bg-success-container text-on-success-container hover:border-success/50",
    },
    {
      appearance: "soft",
      color: "warning",
      className:
        "border-warning/35 bg-warning-container text-on-warning-container hover:border-warning/50",
    },
    {
      appearance: "soft",
      color: "neutral",
      className:
        "border-outline bg-surface-container-high text-on-surface-muted hover:border-outline-strong hover:text-on-surface",
    },
    {
      appearance: "soft",
      color: "secondary",
      className:
        "border-secondary/35 bg-secondary-container text-on-secondary-container hover:border-secondary/50",
    },
    {
      appearance: "soft",
      color: "error",
      className:
        "border-error/35 bg-error-container text-on-error-container hover:border-error/50",
    },
    {
      appearance: "outline",
      color: "primary",
      className:
        "border-outline text-on-surface hover:border-outline-strong hover:bg-primary-container",
    },
    {
      appearance: "outline",
      color: "secondary",
      className:
        "border-outline text-on-surface-variant hover:border-outline-strong hover:bg-secondary-container hover:text-on-surface",
    },
    {
      appearance: "outline",
      color: "neutral",
      className:
        "border-outline text-on-surface-muted hover:border-outline-strong hover:bg-surface-container-high hover:text-on-surface",
    },
    {
      appearance: "outline",
      color: "error",
      className:
        "border-error/40 text-on-error-container hover:border-error/60 hover:bg-error-container",
    },
    {
      appearance: "outline",
      color: "success",
      className:
        "border-success/40 text-on-success-container hover:border-success/60 hover:bg-success-container",
    },
    {
      appearance: "outline",
      color: "warning",
      className:
        "border-warning/40 text-on-warning-container hover:border-warning/60 hover:bg-warning-container",
    },
    {
      appearance: "standard",
      color: "primary",
      className: "text-primary hover:opacity-90",
    },
    {
      appearance: "standard",
      color: "secondary",
      className: "text-secondary hover:opacity-90",
    },
    {
      appearance: "standard",
      color: "success",
      className: "text-success hover:opacity-90",
    },
    {
      appearance: "standard",
      color: "warning",
      className: "text-warning hover:opacity-90",
    },
    {
      appearance: "standard",
      color: "neutral",
      className: "text-on-surface-muted hover:text-on-surface",
    },
    {
      appearance: "standard",
      color: "error",
      className: "text-error hover:opacity-90",
    },
    {
      iconOnly: true,
      size: "xs",
      className: "h-8 w-8 p-0",
    },
    {
      iconOnly: true,
      size: "sm",
      className: "h-9 w-9 p-0",
    },
    {
      iconOnly: true,
      size: "md",
      className: "h-10 w-10 p-0",
    },
    {
      iconOnly: true,
      size: "lg",
      className: "h-11 w-11 p-0",
    },
  ],
  defaultVariants: {
    appearance: "filled",
    color: "primary",
    size: "md",
    shape: "square",
    uppercase: false,
    iconOnly: false,
  },
});

type ButtonVariants = VariantProps<typeof buttonStyles>;

type IconName = keyof typeof LucideIcons;
type IconComponent = (props: { className?: string }) => ReactNode;

type ButtonIconProps = {
  icon?: ReactNode;
  iconName?: IconName;
  iconPosition?: "start" | "end";
  iconClassName?: string;
};

type ButtonProps = ComponentPropsWithoutRef<"button"> &
  ButtonVariants &
  ButtonIconProps;

export const Button = ({
  color,
  appearance,
  size,
  shape,
  uppercase,
  className,
  children,
  icon,
  iconName,
  iconPosition = "start",
  iconClassName,
  ...props
}: ButtonProps) => {
  const hasOnlyIcon = !children && Boolean(icon || iconName);
  const NamedIcon = iconName
    ? (LucideIcons as unknown as Record<string, IconComponent>)[iconName]
    : null;
  const resolvedIcon =
    icon ??
    (NamedIcon ? <NamedIcon className={iconClassName ?? "h-4 w-4"} /> : null);

  return (
    <button
      className={buttonStyles({
        color,
        appearance,
        size,
        shape,
        uppercase,
        iconOnly: hasOnlyIcon && size !== "full",
        className,
      })}
      {...props}
    >
      {iconPosition === "start" ? resolvedIcon : null}
      {children}
      {iconPosition === "end" ? resolvedIcon : null}
    </button>
  );
};

type ButtonLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "to" | "params" | "search"
> & {
  to: string;
  params?: Record<string, string | number | undefined>;
  search?: Record<string, unknown>;
} & ButtonVariants &
  ButtonIconProps;

export const ButtonLink = ({
  color,
  appearance,
  size,
  shape,
  uppercase,
  className,
  children,
  icon,
  iconName,
  iconPosition = "start",
  iconClassName,
  ...props
}: ButtonLinkProps) => {
  const hasOnlyIcon = !children && Boolean(icon || iconName);
  const NamedIcon = iconName
    ? (LucideIcons as unknown as Record<string, IconComponent>)[iconName]
    : null;
  const resolvedIcon =
    icon ??
    (NamedIcon ? <NamedIcon className={iconClassName ?? "h-4 w-4"} /> : null);
  const hasFunctionChildren = typeof children === "function";

  return (
    <Link
      className={buttonStyles({
        color,
        appearance,
        size,
        shape,
        uppercase,
        iconOnly: hasOnlyIcon && size !== "full",
        className,
      })}
      {...props}
    >
      {hasFunctionChildren ? (
        children
      ) : (
        <>
          {iconPosition === "start" ? resolvedIcon : null}
          {children}
          {iconPosition === "end" ? resolvedIcon : null}
        </>
      )}
    </Link>
  );
};
