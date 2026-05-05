import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { CenterModal } from "@/shared/components/modals/CenterModal";

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (payload: { runs: number; reason?: string }) => void;
};

export const PenaltyRunsModal = ({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: Props) => {
  const [runs, setRuns] = useState("5");
  const [reason, setReason] = useState("");
  const formId = "penalty-runs-form";

  useEffect(() => {
    if (isOpen) {
      setRuns("5");
      setReason("");
    }
  }, [isOpen]);

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Add penalty runs"
      description="Add penalty runs to the current innings."
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
            {isSubmitting ? "Adding..." : "Add penalty"}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const parsedRuns = Number(runs);
          onConfirm({
            runs: parsedRuns,
            reason: reason.trim() ? reason.trim() : undefined,
          });
        }}
      >
        <FormGroup label="Penalty runs">
          <InputField
            type="number"
            value={runs}
            onChange={(event) => setRuns(event.target.value)}
            disabled={isSubmitting}
            placeholder="Use + or - value"
          />
        </FormGroup>
        <FormGroup label="Reason (optional)">
          <InputField
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isSubmitting}
            placeholder="Reason"
          />
        </FormGroup>
      </form>
    </CenterModal>
  );
};
