import { tv, type VariantProps } from "tailwind-variants";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";

const buttonStyles = tv({
  base: "inline-flex cursor-pointer items-center justify-center gap-2  text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-70",
  variants: {
    shape: {
      square: "rounded-lg",
      rounded: "rounded-full",
    },
    appearance: {
      filled: "shadow-lg transition hover:-translate-y-0.5",
      tonal: "shadow-sm",
      outline: "border",
      standard: "bg-transparent",
    },
    color: {
      primary: "",
      secondary: "",
      neutral: "",
      error: "",
    },
    size: {
      sm: "px-4 py-2",
      md: "px-5 py-2.5",
      lg: "px-6 py-3",
      full: "w-full px-6 py-3",
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
        "bg-primary-40 text-neutral-98 shadow-primary-40/25 hover:shadow-primary-40/40",
    },
    {
      appearance: "filled",
      color: "secondary",
      className:
        "bg-secondary-40 text-neutral-98 shadow-secondary-40/25 hover:shadow-secondary-40/40",
    },
    {
      appearance: "filled",
      color: "neutral",
      className:
        "bg-neutral-40 text-neutral-98 shadow-neutral-40/25 hover:shadow-neutral-40/40",
    },
    {
      appearance: "filled",
      color: "error",
      className:
        "bg-error-40 text-neutral-98 shadow-error-40/25 hover:shadow-error-40/40",
    },
    {
      appearance: "tonal",
      color: "primary",
      className: "bg-primary-90 text-primary-10",
    },
    {
      appearance: "tonal",
      color: "secondary",
      className: "bg-secondary-90 text-secondary-10",
    },
    {
      appearance: "tonal",
      color: "neutral",
      className: "bg-neutral-90 text-neutral-10",
    },
    {
      appearance: "tonal",
      color: "error",
      className: "bg-error-95 text-error-40",
    },
    {
      appearance: "outline",
      color: "primary",
      className:
        "border-neutral-90 text-primary-20 hover:border-neutral-80 hover:bg-primary-95 hover:text-primary-10",
    },
    {
      appearance: "outline",
      color: "secondary",
      className:
        "border-neutral-90 text-secondary-30 hover:border-neutral-80 hover:bg-secondary-95 hover:text-secondary-20",
    },
    {
      appearance: "outline",
      color: "neutral",
      className:
        "border-neutral-90 text-neutral-40 hover:border-neutral-80 hover:bg-neutral-95 hover:text-neutral-30",
    },
    {
      appearance: "outline",
      color: "error",
      className:
        "border-error-80 text-error-40 hover:border-error-70 hover:bg-error-95",
    },
    {
      appearance: "standard",
      color: "primary",
      className: "text-primary-20 hover:text-primary-10",
    },
    {
      appearance: "standard",
      color: "secondary",
      className: "text-secondary-30 hover:text-secondary-20",
    },
    {
      appearance: "standard",
      color: "neutral",
      className: "text-neutral-40 hover:text-neutral-30",
    },
    {
      appearance: "standard",
      color: "error",
      className: "text-error-40 hover:text-error-30",
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
      className: "h-12 w-12 p-0",
    },
  ],
  defaultVariants: {
    appearance: "filled",
    color: "primary",
    size: "md",
    shape: "rounded",
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
  const resolvedIcon = icon ??
    (NamedIcon ? <NamedIcon className={iconClassName ?? "h-4 w-4"} /> : null);

  return (
    <button
      className={buttonStyles({
        color,
        appearance,
        size,
        shape,
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

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> &
  ButtonVariants &
  ButtonIconProps;

export const ButtonLink = ({
  color,
  appearance,
  size,
  shape,
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
  const resolvedIcon = icon ??
    (NamedIcon ? <NamedIcon className={iconClassName ?? "h-4 w-4"} /> : null);
  const hasFunctionChildren = typeof children === "function";

  return (
    <Link
      className={buttonStyles({
        color,
        appearance,
        size,
        shape,
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
