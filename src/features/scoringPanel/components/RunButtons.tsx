import { Button } from "@/components/ui/button/Button";
import type { RunValue } from "../types/scoringPanel.types";

type Props = {
  disabled?: boolean;
  onRunClick: (runs: RunValue) => void;
};

const RUN_VALUES: RunValue[] = [0, 1, 2, 3, 4, 6];

export const RunButtons = ({ disabled, onRunClick }: Props) => (
  <div className="grid grid-cols-3 gap-2">
    {RUN_VALUES.map((run) => (
      <Button
        key={run}
        type="button"
        appearance="tonal"
        color={
          run === 4
            ? "success"
            : run === 6
              ? "primary"
              : "neutral"
        }
        size="md"
        disabled={disabled}
        onClick={() => onRunClick(run)}
        className="h-16 w-full flex-col gap-1 border border-outline font-display text-4xl font-bold tracking-wide"
      >
        <>
          <span>{run}</span>
          {run === 4 ? (
            <span className="text-2xs leading-none font-bold uppercase tracking-widest">
              Four
            </span>
          ) : null}
          {run === 6 ? (
            <span className="text-2xs leading-none font-bold uppercase tracking-widest">
              Six
            </span>
          ) : null}
        </>
      </Button>
    ))}
  </div>
);
