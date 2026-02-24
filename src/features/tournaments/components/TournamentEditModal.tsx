import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { Button } from "@/components/ui/button/Button";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import { buildPatchPayload, isEmptyPatch } from "@/shared/utils/patch";
import { getApiErrorMessage, normalizeApiError } from "@/shared/utils/apiErrors";
import {
  tournamentUpdateSchema,
  type TournamentUpdateFormValues,
  type TournamentUpdateValues,
} from "@/features/tournaments/schemas/tournamentUpdateSchema";
import { useUpdateTournamentMutation } from "../hooks/useUpdateTournamentMutation";
import type {
  TournamentDetails,
  TournamentType,
  TournamentUpdateInput,
} from "@/features/tournaments/types/tournamentTypes";

const toDateInput = (value?: string | null) =>
  value ? value.split("T")[0] : "";

const normalizeTournamentPatch = (
  payload: Record<string, unknown>,
): TournamentUpdateInput => {
  const next: Record<string, unknown> = { ...payload };
  ["location", "startDate", "endDate"].forEach((key) => {
    if (key in next && next[key] === "") {
      next[key] = null;
    }
  });

  if ("qualificationCount" in next) {
    const rawValue = next.qualificationCount;
    delete next.qualificationCount;
    if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      next.rules = { qualificationCount: rawValue };
    }
  }

  return next as TournamentUpdateInput;
};

type Props = {
  tournament: TournamentDetails;
  isTypeLocked?: boolean;
  isOpen: boolean;
  onClose: () => void;
};

export const TournamentEditModal = ({
  tournament,
  isTypeLocked = false,
  isOpen,
  onClose,
}: Props) => {
  const navigate = useNavigate();
  const mutation = useUpdateTournamentMutation(tournament.id);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      name: tournament.name ?? "",
      location: tournament.location ?? "",
      startDate: toDateInput(tournament.startDate),
      endDate: toDateInput(tournament.endDate),
      type: tournament.type ?? "LEAGUE",
      oversPerInnings: tournament.oversPerInnings ?? 20,
      ballsPerOver: tournament.ballsPerOver ?? 6,
      qualificationCount: tournament.rules?.qualificationCount ?? 4,
      status: tournament.status ?? "DRAFT",
    }),
    [tournament],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
  } = useForm<TournamentUpdateFormValues, unknown, TournamentUpdateValues>({
    resolver: zodResolver(tournamentUpdateSchema),
    defaultValues,
  });
  const selectedType = useWatch({ control, name: "type" }) as
    | TournamentType
    | undefined;
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
  const tournamentStatusOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
  ];
  const qualificationOptions = [
    { value: "2", label: "Top 2 teams" },
    { value: "4", label: "Top 4 teams" },
  ];

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues, { keepDirty: false });
    }
  }, [defaultValues, isOpen, reset]);

  const onSubmit = async (values: TournamentUpdateValues) => {
    setFormError(null);
    const patch = buildPatchPayload(values, dirtyFields);
    const normalized = normalizeTournamentPatch(
      patch as Record<string, unknown>,
    );

    if (isEmptyPatch(normalized as Record<string, unknown>)) {
      setFormError("Change at least one field before saving.");
      return;
    }

    try {
      await mutation.mutateAsync(normalized);
      toast.success("Tournament updated.");
      onClose();
      await navigate({ to: `/tournaments/${tournament.id}` });
    } catch (err) {
      const normalizedError = normalizeApiError(err);
      if (normalizedError.code === "tournament.type_locked") {
        setFormError("Tournament type can't be changed after a match has started.");
        return;
      }
      if (normalizedError.code === "tournament.config_locked") {
        setFormError(
          "Tournament format and over configuration are locked after scoring data exists.",
        );
        return;
      }
      setFormError(getApiErrorMessage(err, "Unable to update tournament."));
    }
  };

  const isBusy = isSubmitting || mutation.isPending;

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Tournament"
      description="Update tournament details."
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
            form="tournament-edit-form"
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      }
    >
      <form
        id="tournament-edit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {formError ? (
          <div className="rounded-2xl border border-error-80 bg-error-95 p-3 text-xs text-error-40">
            {formError}
          </div>
        ) : null}
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
          <SelectField
            options={tournamentTypeOptions}
            disabled={isTypeLocked}
            {...register("type")}
          />
        </FormGroup>
        {isTypeLocked ? (
          <p className="-mt-2 text-xs text-warning-30">
            Tournament type can't be changed after a match has started.
          </p>
        ) : null}

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
                  value === "" || value === null ? undefined : Number(value),
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
            {...register("oversPerInnings", {
              setValueAs: (value) =>
                value === "" || value === null ? undefined : Number(value),
            })}
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
            {...register("ballsPerOver", {
              setValueAs: (value) =>
                value === "" || value === null ? undefined : Number(value),
            })}
          />
        </FormGroup>

        <FormGroup
          label="Status"
          hint="Draft is setup mode, Active runs live matches, Completed is closed."
          error={errors.status?.message}
        >
          <SelectField
            options={tournamentStatusOptions}
            {...register("status")}
          />
        </FormGroup>
      </form>
    </RightSideModal>
  );
};
