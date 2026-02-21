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
  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
    {OPTIONS.map((option) => {
      const isSelected = selectedExtraType === option.value;
      return (
      <Button
        key={option.value}
        type="button"
        appearance={isSelected ? "filled" : "outline"}
        color={isSelected ? "secondary" : "neutral"}
        size="sm"
        disabled={disabled}
        aria-pressed={isSelected}
        onClick={() => onToggle(option.value)}
        className="px-2"
      >
        {option.label}
      </Button>
      );
    })}
  </div>
);
