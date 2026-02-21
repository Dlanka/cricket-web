import { Button } from "@/components/ui/button/Button";

type Props = {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const VALUES = [0, 1, 2, 3, 4, 5, 6];

export const AdditionalRunsSelector = ({ value, disabled, onChange }: Props) => (
  <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
    {VALUES.map((runs) => (
      <Button
        key={runs}
        type="button"
        appearance={runs === value ? "filled" : "outline"}
        color={runs === value ? "primary" : "neutral"}
        size="sm"
        disabled={disabled}
        onClick={() => onChange(runs)}
      >
        +{runs}
      </Button>
    ))}
  </div>
);
