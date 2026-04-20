import type { ComponentPropsWithoutRef } from "react";

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectFieldProps = Omit<ComponentPropsWithoutRef<"select">, "children"> & {
  options?: SelectOption[];
};

export const SelectField = ({
  className,
  options,
  ...props
}: SelectFieldProps) => (
  <select
    className={`w-full rounded-xl border border-outline bg-surface-container px-3 py-2 text-sm text-on-surface ${className ?? ""}`}
    {...props}
  >
    {options?.map((option) => (
      <option
        key={option.value}
        value={option.value}
        disabled={option.disabled}
      >
        {option.label}
      </option>
    ))}
  </select>
);

