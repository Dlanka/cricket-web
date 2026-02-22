import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  teamCreateSchema,
  type TeamCreateFormValues,
  type TeamCreateValues,
} from "@/features/teams/schemas/teams.schemas";
import { useCreateTeamMutation } from "../hooks/useCreateTeamMutation";
import type { CreateTeamRequest } from "../types/teams.types";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { Button } from "@/components/ui/button/Button";
import { InputField } from "@/components/ui/form/InputField";

type Props = {
  tournamentId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const TeamCreateModal = ({ tournamentId, isOpen, onClose }: Props) => {
  const mutation = useCreateTeamMutation(tournamentId);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TeamCreateFormValues>({
    resolver: zodResolver(teamCreateSchema),
  });

  const onSubmit = async (values: TeamCreateFormValues) => {
    const payload: TeamCreateValues = teamCreateSchema.parse(values);
    const input: CreateTeamRequest = payload;

    try {
      await mutation.mutateAsync(input);
      toast.success("Team created.");
      reset();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create team.";
      toast.error(message);
    }
  };

  const isBusy = isSubmitting || mutation.isPending;

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team"
      description="Create a tournament team."
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
            disabled={isBusy}
            form="team-create-form"
          >
            {mutation.isPending ? "Saving..." : "Add team"}
          </Button>
        </div>
      }
    >
      <form
        id="team-create-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <FormGroup label="Team name" error={errors.name?.message}>
          <InputField placeholder="Colombo Kings" {...register("name")} />
        </FormGroup>
        <FormGroup label="Short name" error={errors.shortName?.message}>
          <InputField placeholder="CK" {...register("shortName")} />
        </FormGroup>
        <FormGroup
          label="Contact person"
          error={errors.contactPerson?.message}
          hint="Optional team contact person."
        >
          <InputField placeholder="Nimal Perera" {...register("contactPerson")} />
        </FormGroup>
        <FormGroup
          label="Contact number"
          error={errors.contactNumber?.message}
          hint="Optional. Use +, digits, spaces, (), -, ."
        >
          <InputField
            placeholder="+94 77 123 4567"
            {...register("contactNumber")}
          />
        </FormGroup>
      </form>
    </RightSideModal>
  );
};
