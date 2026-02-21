import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

const tabsContainerStyles = tv({
  base: "inline-flex rounded-xl border border-neutral-90 bg-neutral-98 p-1",
  variants: {
    fullWidth: {
      true: "grid w-full",
      false: "",
    },
  },
});

const tabTriggerStyles = tv({
  base: "rounded-lg px-4 py-2 text-sm font-semibold transition",
  variants: {
    active: {
      true: "bg-primary-90 text-primary-20",
      false: "bg-transparent text-neutral-40 hover:bg-neutral-96",
    },
  },
});

type TabItem = {
  value: string;
  label: ReactNode;
  title?: string;
};

type TabsProps = {
  value: string;
  items: TabItem[];
  onChange: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
};

export const Tabs = ({
  value,
  items,
  onChange,
  className,
  fullWidth = false,
}: TabsProps) => (
  <div
    className={tabsContainerStyles({
      fullWidth,
      className,
    })}
    style={fullWidth ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined}
  >
    {items.map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => onChange(item.value)}
        title={item.title}
        className={tabTriggerStyles({ active: value === item.value })}
      >
        {item.label}
      </button>
    ))}
  </div>
);

