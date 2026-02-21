import { Button } from "@/components/ui/button/Button";

type Props = {
  disabled?: boolean;
  undoDisabled?: boolean;
  showCompletedButton?: boolean;
  showChangeBowlerButton?: boolean;
  changeBowlerDisabled?: boolean;
  showStartSecondInningsButton?: boolean;
  startSecondInningsDisabled?: boolean;
  onUndo: () => void;
  onSwap: () => void;
  onRetire: () => void;
  onChangeBowler?: () => void;
  onStartSecondInnings?: () => void;
  onCompleted?: () => void;
};

export const ScoringActionBar = ({
  disabled,
  undoDisabled,
  showCompletedButton,
  showChangeBowlerButton,
  changeBowlerDisabled,
  showStartSecondInningsButton,
  startSecondInningsDisabled,
  onUndo,
  onSwap,
  onRetire,
  onChangeBowler,
  onStartSecondInnings,
  onCompleted,
}: Props) => {
  if (showCompletedButton) {
    return (
      <div className="pt-4">
        <Button
          type="button"
          appearance="filled"
          color="primary"
          size="md"
          className="w-full"
          onClick={onCompleted}
        >
          Completed
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-between gap-2 pt-4">
      <Button
        type="button"
        appearance="outline"
        color="neutral"
        size="md"
        disabled={undoDisabled}
        onClick={onUndo}
      >
        Undo
      </Button>

      <div className="flex items-center gap-2">
        {showStartSecondInningsButton ? (
          <Button
            type="button"
            size="md"
            disabled={startSecondInningsDisabled}
            onClick={onStartSecondInnings}
          >
            Start second innings
          </Button>
        ) : showChangeBowlerButton ? (
          <Button
            type="button"
            size="md"
            disabled={changeBowlerDisabled}
            onClick={onChangeBowler}
          >
            Change bowler
          </Button>
        ) : (
          <>
            <Button
              type="button"
              appearance="outline"
              color="neutral"
              size="md"
              disabled={disabled}
              onClick={onSwap}
            >
              Swap
            </Button>
            <Button
              type="button"
              appearance="outline"
              color="secondary"
              size="md"
              disabled={disabled}
              onClick={onRetire}
            >
              Retire
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
