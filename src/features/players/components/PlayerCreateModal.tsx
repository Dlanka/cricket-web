import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  playerCreateSchema,
  type PlayerCreateFormValues,
  type PlayerCreateValues,
} from "@/features/players/schemas/players.schemas";
import { useCreatePlayerMutation } from "../hooks/useCreatePlayerMutation";
import type { CreatePlayerRequest } from "../types/players.types";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { Button } from "@/components/ui/button/Button";
import { getApiErrorMessage } from "@/shared/utils/apiErrors";
import {
  BATTING_STYLE_OPTIONS,
  BOWLING_STYLE_OPTIONS,
} from "@/features/players/constants/playerStyles";

type Props = {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const PlayerCreateModal = ({ teamId, isOpen, onClose }: Props) => {
  const mutation = useCreatePlayerMutation(teamId);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PlayerCreateFormValues>({
    resolver: zodResolver(playerCreateSchema),
  });

  const onSubmit = async (values: PlayerCreateFormValues) => {
    setFormError(null);
    const payload: PlayerCreateValues = playerCreateSchema.parse(values);
    const input: CreatePlayerRequest = payload;

    try {
      await mutation.mutateAsync(input);
      toast.success("Player created.");
      reset();
      handleClose();
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to create player.");
      setFormError(message);
      toast.error(message);
    }
  };

  const handleClose = () => {
    setFormError(null);
    onClose();
  };

  const isBusy = isSubmitting || mutation.isPending;

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Player"
      description="Add a player to the squad."
      closeOnOverlayClick={!isBusy}
      showCloseButton={!isBusy}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            size="sm"
            onClick={handleClose}
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
            form="player-create-form"
          >
            {mutation.isPending ? "Saving..." : "Add player"}
          </Button>
        </div>
      }
    >
      <form
        id="player-create-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {formError ? (
          <div className="rounded-2xl border border-error-80 bg-error-95 p-3 text-xs text-error-40">
            {formError}
          </div>
        ) : null}
        <FormGroup label="Player name" error={errors.fullName?.message}>
          <input
            className="w-full rounded-xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10 shadow-sm focus:border-neutral-80 focus:outline-none"
            placeholder="Player name"
            {...register("fullName")}
          />
        </FormGroup>
        <FormGroup label="Jersey number" error={errors.jerseyNumber?.message}>
          <input
            type="number"
            className="w-full rounded-xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10 shadow-sm focus:border-neutral-80 focus:outline-none"
            placeholder="7"
            {...register("jerseyNumber", {
              setValueAs: (value) =>
                value === "" || value === null ? undefined : Number(value),
            })}
          />
        </FormGroup>
        <FormGroup label="Batting style" error={errors.battingStyle?.message}>
          <select
            className="w-full rounded-xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10 shadow-sm focus:border-neutral-80 focus:outline-none"
            defaultValue=""
            {...register("battingStyle", {
              setValueAs: (value) => (value === "" ? undefined : value),
            })}
          >
            <option value="">Select batting style (optional)</option>
            {BATTING_STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormGroup>
        <FormGroup label="Bowling style" error={errors.bowlingStyle?.message}>
          <select
            className="w-full rounded-xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10 shadow-sm focus:border-neutral-80 focus:outline-none"
            defaultValue=""
            {...register("bowlingStyle", {
              setValueAs: (value) => (value === "" ? undefined : value),
            })}
          >
            <option value="">Select bowling style (optional)</option>
            {BOWLING_STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormGroup>
        <label className="flex items-center gap-3 rounded-2xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary-40"
            {...register("isWicketKeeper")}
          />
          Wicket keeper
        </label>
      </form>
    </RightSideModal>
  );
};
