import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { Button } from "@/components/ui/button/Button";

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const RegenerateFixturesConfirmModal = ({
  isOpen,
  isSubmitting,
  onCancel,
  onConfirm,
}: Props) => (
  <RightSideModal
    isOpen={isOpen}
    onClose={isSubmitting ? () => undefined : onCancel}
    title="Regenerate fixtures?"
    description="This replaces current scheduled fixtures."
    closeOnOverlayClick={!isSubmitting}
    showCloseButton={!isSubmitting}
    footer={
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          appearance="outline"
          color="neutral"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Regenerating..." : "Confirm regenerate"}
        </Button>
      </div>
    }
  >
    <p className="text-sm text-neutral-40">
      Regenerating replaces the currently scheduled fixtures using the latest
      tournament config.
    </p>
  </RightSideModal>
);
