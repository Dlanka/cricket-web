import { useMemo } from "react";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import type { Player } from "../../players/types/players.types";

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  players: Player[];
  currentBowlerId?: string;
  selectedBowlerId: string;
  onSelectBowler: (bowlerId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export const NextBowlerModal = ({
  isOpen,
  isSubmitting,
  players,
  currentBowlerId,
  selectedBowlerId,
  onSelectBowler,
  onClose,
  onConfirm,
}: Props) => {
  const formId = "next-bowler-form";
  const availablePlayers = useMemo(
    () => players.filter((player) => player.id !== currentBowlerId),
    [players, currentBowlerId],
  );
  const bowlerOptions = useMemo(
    () => [
      { value: "", label: "Select bowler" },
      ...availablePlayers.map((player) => ({
        value: player.id,
        label: `${player.fullName}${player.jerseyNumber != null ? ` (#${player.jerseyNumber})` : ""}`,
      })),
    ],
    [availablePlayers],
  );

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Select next bowler"
      description="The over is complete. Pick who bowls the next over."
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
            Close
          </Button>
          <Button
            type="submit"
            form={formId}
            size="sm"
            disabled={isSubmitting || !selectedBowlerId}
          >
            Confirm bowler
          </Button>
        </div>
      }
    >
      <form id={formId} className="space-y-4" onSubmit={(event) => {
        event.preventDefault();
        onConfirm();
      }}>
        <FormGroup label="Bowler">
          <SelectField
            options={bowlerOptions}
            value={selectedBowlerId}
            onChange={(event) => onSelectBowler(event.target.value)}
            disabled={isSubmitting}
          />
        </FormGroup>
      </form>
    </RightSideModal>
  );
};
