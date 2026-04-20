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
  const renderUndoButton = () => (
    <Button
      type="button"
      appearance="tonal"
      color="neutral"
      size="sm"
      uppercase
      disabled={undoDisabled}
      onClick={onUndo}
      className="h-10 min-w-0 flex-1 justify-center border border-outline font-display tracking-wider"
    >
      Undo
    </Button>
  );

  const renderRightActions = () => {
    if (showStartSecondInningsButton) {
      return (
        <div className="col-span-2">
          <Button
            type="button"
            appearance="tonal"
            color="primary"
            size="sm"
            uppercase
            disabled={startSecondInningsDisabled}
            onClick={onStartSecondInnings}
            className="h-10 w-full min-w-0 justify-center border border-primary/35 font-display tracking-wider"
          >
            Start second innings
          </Button>
        </div>
      );
    }

    if (showChangeBowlerButton) {
      return (
        <div className="col-span-2">
          <Button
            type="button"
            appearance="tonal"
            color="primary"
            size="sm"
            uppercase
            disabled={changeBowlerDisabled}
            onClick={onChangeBowler}
            className="h-10 w-full min-w-0 justify-center border border-primary/35 font-display tracking-wider"
          >
            Change bowler
          </Button>
        </div>
      );
    }

    return (
      <>
        <Button
          type="button"
          appearance="tonal"
          color="primary"
          size="sm"
          uppercase
          disabled={disabled}
          onClick={onSwap}
          className="h-10 min-w-0 flex-1 justify-center border border-primary/35 font-display tracking-wider"
        >
          Swap
        </Button>
        <Button
          type="button"
          appearance="tonal"
          color="secondary"
          size="sm"
          uppercase
          disabled={disabled}
          onClick={onRetire}
          className="h-10 min-w-0 flex-1 justify-center border border-secondary/35 font-display tracking-wider"
        >
          Retire
        </Button>
      </>
    );
  };

  if (showCompletedButton) {
    return (
      <div className="grid grid-cols-2 gap-2 pt-2">
        {renderUndoButton()}

        <Button
          type="button"
          appearance="filled"
          color="primary"
          size="sm"
          uppercase
          className="h-10 w-full justify-center font-display tracking-wider"
          onClick={onCompleted}
        >
          Completed
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 pt-2">
      {renderUndoButton()}
      {renderRightActions()}
    </div>
  );
};
