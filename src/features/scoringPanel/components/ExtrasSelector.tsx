import { Button } from "@/components/ui/button/Button";
import type { ExtraType } from "../types/scoringPanel.types";

type Props = {
  selectedExtraType: ExtraType | null;
  disabled?: boolean;
  onToggle: (extraType: ExtraType) => void;
};

const OPTIONS: { value: ExtraType; label: string }[] = [
  { value: "wide", label: "Wide" },
  { value: "noBall", label: "No-ball" },
  { value: "byes", label: "Byes" },
  { value: "legByes", label: "Leg byes" },
];

export const ExtrasSelector = ({
  selectedExtraType,
  disabled,
  onToggle,
}: Props) => (
  <div className="grid grid-cols-2 gap-2">
    {OPTIONS.map((option) => {
      const isSelected = selectedExtraType === option.value;
      return (
        <Button
          key={option.value}
          type="button"
          appearance="tonal"
          color={isSelected ? "warning" : "neutral"}
          size="sm"
          uppercase
          disabled={disabled}
          aria-pressed={isSelected}
          onClick={() => onToggle(option.value)}
          className={`h-10 w-full justify-center border font-display tracking-wider ${
            isSelected ? "border-warning/40" : "border-outline"
          }`}
        >
          {option.label}
        </Button>
      );
    })}
  </div>
);
