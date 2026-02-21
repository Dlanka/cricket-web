import { Button } from "@/components/ui/button/Button";
import type { RunValue } from "../types/scoringPanel.types";

type Props = {
  disabled?: boolean;
  onRunClick: (runs: RunValue) => void;
};

const RUN_VALUES: RunValue[] = [0, 1, 2, 3, 4, 6];

export const RunButtons = ({ disabled, onRunClick }: Props) => (
  <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
    {RUN_VALUES.map((run) => (
      <Button
        key={run}
        type="button"
        appearance="tonal"
        color="primary"
        size="sm"
        disabled={disabled}
        onClick={() => onRunClick(run)}
      >
        {run}
      </Button>
    ))}
  </div>
);
