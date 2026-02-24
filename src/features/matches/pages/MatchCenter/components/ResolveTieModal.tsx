import { useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { SelectField } from "@/components/ui/form/SelectField";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";

type TeamOption = {
  id: string;
  name: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamOption[];
  isSubmitting: boolean;
  errorMessage?: string | null;
  onConfirm: (winnerTeamId: string) => Promise<boolean>;
};

export const ResolveTieModal = ({
  isOpen,
  onClose,
  teams,
  isSubmitting,
  errorMessage,
  onConfirm,
}: Props) => {
  const [winnerTeamId, setWinnerTeamId] = useState("");

  const handleClose = () => {
    setWinnerTeamId("");
    onClose();
  };

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Resolve Tie"
      description="Select winner for tie-break."
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!winnerTeamId || isSubmitting}
            onClick={() =>
              void (async () => {
                const isResolved = await onConfirm(winnerTeamId);
                if (isResolved) handleClose();
              })()
            }
          >
            {isSubmitting ? "Resolving..." : "Resolve tie"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <SelectField
          options={[
            { label: "Select winner", value: "" },
            ...teams.map((team) => ({ label: team.name, value: team.id })),
          ]}
          value={winnerTeamId}
          onChange={(event) => setWinnerTeamId(event.target.value)}
          disabled={isSubmitting}
        />
        {errorMessage ? (
          <div className="rounded-xl border border-error-80 bg-error-95 px-3 py-2 text-xs text-error-40">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </RightSideModal>
  );
};
