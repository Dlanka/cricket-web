import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import type { StartSecondInningsRequest } from "../../scoring/types/scoring.types";

type PlayerOption = {
  id: string;
  name: string;
};

type FormValues = {
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
};

const schema = z
  .object({
    strikerId: z.string().min(1, "Select striker."),
    nonStrikerId: z.string().min(1, "Select non-striker."),
    bowlerId: z.string().min(1, "Select opening bowler."),
  })
  .superRefine((values, ctx) => {
    if (values.strikerId === values.nonStrikerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nonStrikerId"],
        message: "Striker and non-striker must be different.",
      });
    }
  });

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  canStart: boolean;
  battingPlayers: PlayerOption[];
  bowlingPlayers: PlayerOption[];
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: StartSecondInningsRequest) => Promise<void>;
};

export const StartSecondInningsModal = ({
  isOpen,
  isSubmitting,
  canStart,
  battingPlayers,
  bowlingPlayers,
  errorMessage,
  onClose,
  onSubmit,
}: Props) => {
  const formId = "start-second-innings-form";
  const defaultStrikerId = battingPlayers[0]?.id ?? "";
  const defaultNonStrikerId =
    battingPlayers.find((player) => player.id !== defaultStrikerId)?.id ?? "";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      strikerId: defaultStrikerId,
      nonStrikerId: defaultNonStrikerId,
      bowlerId: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    form.reset({
      strikerId: defaultStrikerId,
      nonStrikerId: defaultNonStrikerId,
      bowlerId: "",
    });
  }, [defaultNonStrikerId, defaultStrikerId, form, isOpen]);

  const strikerId = useWatch({
    control: form.control,
    name: "strikerId",
  });
  const filteredNonStrikerPlayers = useMemo(
    () => battingPlayers.filter((player) => player.id !== strikerId),
    [battingPlayers, strikerId],
  );

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });
  const strikerOptions = [
    { value: "", label: "Select striker" },
    ...battingPlayers.map((player) => ({ value: player.id, label: player.name })),
  ];
  const nonStrikerOptions = [
    { value: "", label: "Select non-striker" },
    ...filteredNonStrikerPlayers.map((player) => ({
      value: player.id,
      label: player.name,
    })),
  ];
  const bowlerOptions = [
    { value: "", label: "Select bowler" },
    ...bowlingPlayers.map((player) => ({ value: player.id, label: player.name })),
  ];

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={isSubmitting ? () => undefined : onClose}
      title="Start second innings"
      description="Select opening batters and bowler for innings 2."
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
          <Button
            type="submit"
            form={formId}
            size="sm"
            disabled={!canStart || isSubmitting}
          >
            {isSubmitting ? "Starting..." : "Start second innings"}
          </Button>
        </div>
      }
    >
      <form id={formId} className="space-y-4" onSubmit={submit}>
        <FormGroup label="Opening striker" error={form.formState.errors.strikerId?.message}>
          <SelectField
            options={strikerOptions}
            disabled={!canStart || isSubmitting}
            {...form.register("strikerId")}
          />
        </FormGroup>

        <FormGroup
          label="Opening non-striker"
          error={form.formState.errors.nonStrikerId?.message}
        >
          <SelectField
            options={nonStrikerOptions}
            disabled={!canStart || isSubmitting}
            {...form.register("nonStrikerId")}
          />
        </FormGroup>

        <FormGroup label="Opening bowler" error={form.formState.errors.bowlerId?.message}>
          <SelectField
            options={bowlerOptions}
            disabled={!canStart || isSubmitting}
            {...form.register("bowlerId")}
          />
        </FormGroup>

        {errorMessage ? (
          <div className="rounded-xl border border-error-80 bg-error-95 px-3 py-2 text-sm text-error-40">
            {errorMessage}
          </div>
        ) : null}

        {!canStart ? (
          <p className="text-sm text-neutral-40">
            You do not have permission to start second innings.
          </p>
        ) : null}

      </form>
    </RightSideModal>
  );
};
