import { ScoringActionBar } from "./ScoringActionBar";

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

export const ActionButtons = ({
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
}: Props) => (
  <ScoringActionBar
    disabled={disabled}
    undoDisabled={undoDisabled}
    showCompletedButton={showCompletedButton}
    showChangeBowlerButton={showChangeBowlerButton}
    changeBowlerDisabled={changeBowlerDisabled}
    showStartSecondInningsButton={showStartSecondInningsButton}
    startSecondInningsDisabled={startSecondInningsDisabled}
    onUndo={onUndo}
    onSwap={onSwap}
    onRetire={onRetire}
    onChangeBowler={onChangeBowler}
    onStartSecondInnings={onStartSecondInnings}
    onCompleted={onCompleted}
  />
);
