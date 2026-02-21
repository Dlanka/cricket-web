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
  playerUpdateSchema,
  type PlayerUpdateFormValues,
} from "@/features/players/schemas/players.schemas";
import { useUpdatePlayerMutation } from "../hooks/useUpdatePlayerMutation";
import type { Player, UpdatePlayerRequest } from "../types/players.types";
import {
  BATTING_STYLE_OPTIONS,
  BOWLING_STYLE_OPTIONS,
} from "@/features/players/constants/playerStyles";

type Props = {
  teamId: string;
  player: Player;
  isOpen: boolean;
  onClose: () => void;
};

export const PlayerEditModal = ({ teamId, player, isOpen, onClose }: Props) => {
  const mutation = useUpdatePlayerMutation(player.id, teamId);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, dirtyFields, isDirty },
  } = useForm<PlayerUpdateFormValues>({
    resolver: zodResolver(playerUpdateSchema),
    defaultValues: {
      fullName: player.fullName ?? "",
      jerseyNumber: player.jerseyNumber ?? undefined,
      battingStyle: player.battingStyle ?? undefined,
      bowlingStyle: player.bowlingStyle ?? undefined,
      isWicketKeeper: player.isWicketKeeper ?? false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        {
          fullName: player.fullName ?? "",
          jerseyNumber: player.jerseyNumber ?? undefined,
          battingStyle: player.battingStyle ?? undefined,
          bowlingStyle: player.bowlingStyle ?? undefined,
          isWicketKeeper: player.isWicketKeeper ?? false,
        },
        { keepDirty: false },
      );
    }
  }, [isOpen, reset, player]);

  const onSubmit = async (values: PlayerUpdateFormValues) => {
    setFormError(null);
    const patch = buildPatchPayload(values, dirtyFields) as UpdatePlayerRequest;

    if (isEmptyPatch(patch as Record<string, unknown>)) {
      setFormError("Change at least one field before saving.");
      return;
    }

    try {
      await mutation.mutateAsync(patch);
      toast.success("Player updated.");
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to update player.");
      setFormError(message);
    }
  };

  const isBusy = isSubmitting || mutation.isPending;

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Player"
      description="Update player details."
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
            form="player-edit-form"
          >
            {mutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      }
    >
      <form
        id="player-edit-form"
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
            min={0}
            className="w-full rounded-xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10 shadow-sm focus:border-neutral-80 focus:outline-none"
            {...register("jerseyNumber", {
              setValueAs: (value) =>
                value === "" || value === null ? undefined : Number(value),
            })}
          />
        </FormGroup>
        <FormGroup label="Batting style" error={errors.battingStyle?.message}>
          <select
            className="w-full rounded-xl border border-neutral-90 bg-neutral-99 px-4 py-3 text-sm text-primary-10 shadow-sm focus:border-neutral-80 focus:outline-none"
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
        <label className="flex items-center gap-2 text-sm text-neutral-40">
          <input type="checkbox" className="h-4 w-4" {...register("isWicketKeeper")} />
          Wicket keeper
        </label>
      </form>
    </RightSideModal>
  );
};
