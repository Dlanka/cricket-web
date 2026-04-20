import type { ComponentPropsWithoutRef } from "react";
type InputFieldProps = ComponentPropsWithoutRef<"input">;

export const InputField = ({ className, ...props }: InputFieldProps) => (
  <input
    className={`w-full rounded-xl border border-outline bg-surface-container px-3 py-2 text-sm text-on-surface ${className ?? ""}`}
    {...props}
  />
);

