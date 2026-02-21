import type { ComponentPropsWithoutRef } from "react";
type InputFieldProps = ComponentPropsWithoutRef<"input">;

export const InputField = ({ className, ...props }: InputFieldProps) => (
  <input
    className={`w-full rounded-xl border border-neutral-90 bg-neutral-99 px-3 py-2 text-sm text-primary-10 ${className ?? ""}`}
    {...props}
  />
);
