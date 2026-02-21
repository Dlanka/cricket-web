import { Button } from "@/components/ui/button/Button";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";

type Props = {
  tournamentName: string;
  isOpen: boolean;
  isPending: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export const TournamentDeleteModal = ({
  tournamentName,
  isOpen,
  isPending,
  errorMessage,
  onClose,
  onConfirm,
}: Props) => (
  <RightSideModal
    isOpen={isOpen}
    onClose={onClose}
    title="Delete tournament"
    description="This will permanently remove teams, players, fixtures, innings and scoring data."
    closeOnOverlayClick={!isPending}
    showCloseButton={!isPending}
    footer={
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          appearance="outline"
          color="neutral"
          size="sm"
          disabled={isPending}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          appearance="filled"
          color="error"
          size="sm"
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending ? "Deleting..." : "Delete tournament"}
        </Button>
      </div>
    }
  >
    <div className="space-y-4">
      <div className="rounded-2xl border border-error-80 bg-error-95 p-4 text-sm text-error-40">
        You are about to delete <span className="font-semibold">{tournamentName}</span>.
      </div>
      {errorMessage ? (
        <div className="rounded-2xl border border-error-80 bg-error-95 p-3 text-xs text-error-40">
          {errorMessage}
        </div>
      ) : null}
    </div>
  </RightSideModal>
);
