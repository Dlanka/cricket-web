import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button/Button";

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
};

export const TournamentHeaderActions = ({ onEdit, onDelete }: Props) => {
  if (!onEdit && !onDelete) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {onEdit ? (
        <Button
          type="button"
          appearance="outline"
          color="neutral"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Edit tournament"
          title="Edit tournament"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          appearance="outline"
          color="error"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Delete tournament"
          title="Delete tournament"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
};
