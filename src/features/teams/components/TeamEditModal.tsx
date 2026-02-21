import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { Button } from "@/components/ui/button/Button";
import { buildPatchPayload, isEmptyPatch } from "@/shared/utils/patch";
import { getApiErrorMessage } from "@/shared/utils/apiErrors";
import {
  teamUpdateSchema,
  type TeamUpdateFormValues,
} from "@/features/teams/schemas/teams.schemas";
import { useUpdateTeamMutation } from "../hooks/useUpdateTeamMutation";
import type { Team, UpdateTeamRequest } from "../types/teams.types";

type Props = {
  tournamentId: string;
  team: Team;
  isOpen: boolean;
  onClose: () => void;
};

export const TeamEditModal = ({ tournamentId, team, isOpen, onClose }: Props) => {
  const mutation = useUpdateTeamMutation(team.id, tournamentId);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
  } = useForm<TeamUpdateFormValues>({
    resolver: zodResolver(teamUpdateSchema),
    defaultValues: {
      name: team.name ?? "",
      shortName: team.shortName ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        {
          name: team.name ?? "",
          shortName: team.shortName ?? "",
        },
        { keepDirty: false },
      );
    }
  }, [isOpen, reset, team]);

  const onSubmit = async (values: TeamUpdateFormValues) => {
    setFormError(null);
    const patch = buildPatchPayload(values, dirtyFields) as UpdateTeamRequest;

    if (isEmptyPatch(patch as Record<string, unknown>)) {
      setFormError("Change at least one field before saving.");
      return;
    }

    try {
      await mutation.mutateAsync(patch);
      toast.success("Team updated.");
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to update team.");
      setFormError(message);
    }
  };

  const isBusy = isSubmitting || mutation.isPending;

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Team"
      description="Update the team details."
      closeOnOverlayClick={!isBusy}
      showCloseButton={!isBusy}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            size="sm"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            appearance="filled"
            color="primary"
            size="sm"
            disabled={isBusy || !isDirty}
            form="team-edit-form"
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      }
    >
      <form
        id="team-edit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {formError ? (
          <div className="rounded-2xl border border-error-80 bg-error-95 p-3 text-xs text-error-40">
            {formError}
          </div>
        ) : null}
        <FormGroup label="Team name" error={errors.name?.message}>
          <input
            className="w-full rounded-xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10 shadow-sm focus:border-neutral-80 focus:outline-none"
            placeholder="Colombo Kings"
            {...register("name")}
          />
        </FormGroup>
        <FormGroup label="Short name" error={errors.shortName?.message}>
          <input
            className="w-full rounded-xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10 shadow-sm focus:border-neutral-80 focus:outline-none"
            placeholder="CK"
            {...register("shortName")}
          />
        </FormGroup>
      </form>
    </RightSideModal>
  );
};
