import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { CenterModal } from "@/shared/components/modals/CenterModal";

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  isBallsPerOverLocked: boolean;
  overs: string;
  ballsPerOver: string;
  totalMatchMinutes: string;
  splitByInnings: boolean;
  onChangeOvers: (value: string) => void;
  onChangeBallsPerOver: (value: string) => void;
  onChangeTotalMatchMinutes: (value: string) => void;
  onChangeSplitByInnings: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export const MatchSettingsModal = ({
  isOpen,
  isSubmitting,
  isBallsPerOverLocked,
  overs,
  ballsPerOver,
  totalMatchMinutes,
  splitByInnings,
  onChangeOvers,
  onChangeBallsPerOver,
  onChangeTotalMatchMinutes,
  onChangeSplitByInnings,
  onClose,
  onConfirm,
}: Props) => {
  const formId = "match-settings-form";

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Match settings"
      description={
        isBallsPerOverLocked
          ? "You can still update overs per innings. Balls per over is locked after first legal ball."
          : "Update overs and balls per over."
      }
      closeOnOverlayClick={!isSubmitting}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            size="sm"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save settings"}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <FormGroup label="Overs per innings">
          <InputField
            type="number"
            min={1}
            value={overs}
            onChange={(event) => onChangeOvers(event.target.value)}
            disabled={isSubmitting}
          />
        </FormGroup>
        <FormGroup label="Balls per over">
          <InputField
            type="number"
            min={1}
            value={ballsPerOver}
            onChange={(event) => onChangeBallsPerOver(event.target.value)}
            disabled={isSubmitting || isBallsPerOverLocked}
          />
        </FormGroup>
        <FormGroup label="Total match minutes">
          <InputField
            type="number"
            min={1}
            value={totalMatchMinutes}
            onChange={(event) => onChangeTotalMatchMinutes(event.target.value)}
            disabled={isSubmitting}
          />
        </FormGroup>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={splitByInnings}
            onChange={(event) => onChangeSplitByInnings(event.target.checked)}
            disabled={isSubmitting}
          />
          Split time target by innings
        </label>
      </form>
    </CenterModal>
  );
};
