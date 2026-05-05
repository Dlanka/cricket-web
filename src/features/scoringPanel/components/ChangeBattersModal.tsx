import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import { CenterModal } from "@/shared/components/modals/CenterModal";

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  batterOptions: { id: string; name: string }[];
  strikerId: string;
  nonStrikerId: string;
  onChangeStriker: (id: string) => void;
  onChangeNonStriker: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export const ChangeBattersModal = ({
  isOpen,
  isSubmitting,
  batterOptions,
  strikerId,
  nonStrikerId,
  onChangeStriker,
  onChangeNonStriker,
  onClose,
  onConfirm,
}: Props) => {
  const formId = "change-batters-form";

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Change batters"
      description="Update striker and non-striker."
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
            {isSubmitting ? "Applying..." : "Apply batters"}
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
        <FormGroup label="Striker">
          <SelectField
            options={[
              { value: "", label: "Select striker" },
              ...batterOptions.map((player) => ({
                value: player.id,
                label: player.name,
              })),
            ]}
            value={strikerId}
            onChange={(event) => onChangeStriker(event.target.value)}
            disabled={isSubmitting}
          />
        </FormGroup>
        <FormGroup label="Non-striker">
          <SelectField
            options={[
              { value: "", label: "Select non-striker" },
              ...batterOptions.map((player) => ({
                value: player.id,
                label: player.name,
              })),
            ]}
            value={nonStrikerId}
            onChange={(event) => onChangeNonStriker(event.target.value)}
            disabled={isSubmitting}
          />
        </FormGroup>
      </form>
    </CenterModal>
  );
};

