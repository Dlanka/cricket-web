import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  tournamentCreateSchema,
  type TournamentCreateFormValues,
  type TournamentCreateValues,
} from "@/features/tournaments/schemas/tournamentCreateSchema";
import { useCreateTournament } from "../hooks/useCreateTournament";
import type {
  TournamentCreateInput,
  TournamentType,
} from "@/features/tournaments/types/tournamentTypes";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { Button } from "@/components/ui/button/Button";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const TournamentCreateModal = ({ isOpen, onClose }: Props) => {
  const navigate = useNavigate();
  const mutation = useCreateTournament();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TournamentCreateFormValues>({
    resolver: zodResolver(tournamentCreateSchema),
    defaultValues: {
      type: "LEAGUE",
      oversPerInnings: 20,
      ballsPerOver: 6,
      qualificationCount: 4,
    },
  });
  const selectedType = watch("type") as TournamentType | undefined;
  const tournamentTypeHints: Record<TournamentType, string> = {
    LEAGUE:
      "Every team plays league matches. No knockout or final is generated.",
    KNOCKOUT:
      "Matches are direct elimination rounds. Winners move forward until the final.",
    LEAGUE_KNOCKOUT:
      "League stage is played first, then top teams advance to knockout and final.",
  };
  const tournamentTypeOptions = [
    { value: "LEAGUE", label: "League" },
    { value: "KNOCKOUT", label: "Knockout" },
    { value: "LEAGUE_KNOCKOUT", label: "League + Knockout" },
  ];
  const qualificationOptions = [
    { value: "2", label: "Top 2 teams" },
    { value: "4", label: "Top 4 teams" },
  ];

  const onSubmit = async (values: TournamentCreateFormValues) => {
    const parsed: TournamentCreateValues = tournamentCreateSchema.parse(values);
    const payload: TournamentCreateInput = {
      name: parsed.name,
      type: parsed.type,
      oversPerInnings: parsed.oversPerInnings,
      ballsPerOver: parsed.ballsPerOver,
      location: parsed.location,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
    };

    if (
      parsed.type === "LEAGUE_KNOCKOUT" &&
      parsed.qualificationCount !== undefined
    ) {
      payload.rules = { qualificationCount: parsed.qualificationCount };
    }

    try {
      const result = await mutation.mutateAsync(payload);
      if (!result.id) {
        throw new Error(
          "Tournament created, but no tournament id was returned.",
        );
      }
      toast.success("Tournament created.");
      reset();
      onClose();
      await navigate({ to: `/tournaments/${result.id}` });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create tournament.";
      toast.error(message);
    }
  };

  const isBusy = isSubmitting || mutation.isPending;

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Tournament"
      description="Set up tournament basics and dates."
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
            form="tournament-create-form"
          >
            {mutation.isPending ? "Creating..." : "Create tournament"}
          </Button>
        </div>
      }
    >
      <form
        id="tournament-create-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <FormGroup
          label="Tournament name"
          hint="Use a clear name that helps identify season or year."
          error={errors.name?.message}
        >
          <InputField placeholder="Tournament 2026" {...register("name")} />
        </FormGroup>

        <FormGroup
          label="Location"
          hint="City or venue where the tournament is played."
          error={errors.location?.message}
        >
          <InputField placeholder="Colombo" {...register("location")} />
        </FormGroup>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormGroup
            label="Start date"
            hint="Tournament opening date."
            error={errors.startDate?.message}
          >
            <InputField type="date" {...register("startDate")} />
          </FormGroup>
          <FormGroup
            label="End date"
            hint="Tournament closing date."
            error={errors.endDate?.message}
          >
            <InputField type="date" {...register("endDate")} />
          </FormGroup>
        </div>

        <FormGroup
          label="Tournament type"
          hint={tournamentTypeHints[selectedType || "LEAGUE"]}
          error={errors.type?.message}
        >
          <div className="space-y-2">
            <SelectField
              options={tournamentTypeOptions}
              {...register("type")}
            />
          </div>
        </FormGroup>

        {selectedType === "LEAGUE_KNOCKOUT" ? (
          <FormGroup
            label="Teams advancing to knockout"
            hint="Used only for League + Knockout format."
            error={errors.qualificationCount?.message}
          >
            <SelectField
              options={qualificationOptions}
              {...register("qualificationCount", {
                setValueAs: (value) =>
                  value === "" || value == null ? undefined : Number(value),
              })}
            />
          </FormGroup>
        ) : null}

        <FormGroup
          label="Overs per innings"
          hint="Maximum overs each team can bat."
          error={errors.oversPerInnings?.message}
        >
          <InputField
            type="number"
            min={1}
            {...register("oversPerInnings", { valueAsNumber: true })}
          />
        </FormGroup>

        <FormGroup
          label="Balls per over"
          hint="Standard cricket uses 6 balls per over."
          error={errors.ballsPerOver?.message}
        >
          <InputField
            type="number"
            min={1}
            {...register("ballsPerOver", { valueAsNumber: true })}
          />
        </FormGroup>
      </form>
    </RightSideModal>
  );
};
