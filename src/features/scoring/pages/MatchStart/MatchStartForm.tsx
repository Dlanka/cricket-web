import { useEffect, useMemo, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import type { MatchDetail } from "@/features/matches/types/matches.types";
import type { StartMatchRequest } from "@/features/matches/types/matches.types";
import {
  startMatchSchema,
  type StartMatchValues,
} from "@/features/scoring/schemas/startMatchSchema";

type PlayerOption = {
  id: string;
  name: string;
};

type TeamRosterOptions = {
  teamAPlayers: PlayerOption[];
  teamBPlayers: PlayerOption[];
};

type Props = {
  match: MatchDetail;
  options: TeamRosterOptions;
  isSubmitting: boolean;
  canStart: boolean;
  onSubmit: (payload: StartMatchRequest) => Promise<void>;
  errorMessage?: string | null;
  alignSubmitRight?: boolean;
  preferredBattingTeamId?: string;
  secondaryAction?: ReactNode;
};

export const MatchStartForm = ({
  match,
  options,
  isSubmitting,
  canStart,
  onSubmit,
  errorMessage,
  alignSubmitRight = false,
  preferredBattingTeamId,
  secondaryAction,
}: Props) => {
  const form = useForm<StartMatchValues>({
    resolver: zodResolver(startMatchSchema),
    defaultValues: {
      battingTeamId: match.teams.teamA.id,
      strikerId: "",
      nonStrikerId: "",
      bowlerId: "",
    },
  });

  const battingTeamId = useWatch({
    control: form.control,
    name: "battingTeamId",
  });

  useEffect(() => {
    if (!preferredBattingTeamId) return;
    if (battingTeamId === preferredBattingTeamId) return;
    form.setValue("battingTeamId", preferredBattingTeamId);
    form.setValue("strikerId", "");
    form.setValue("nonStrikerId", "");
    form.setValue("bowlerId", "");
  }, [preferredBattingTeamId, battingTeamId, form]);

  const battingTeamPlayers = useMemo(
    () =>
      battingTeamId === match.teams.teamA.id
        ? options.teamAPlayers
        : options.teamBPlayers,
    [battingTeamId, match.teams.teamA.id, options.teamAPlayers, options.teamBPlayers],
  );

  const bowlingTeamPlayers = useMemo(
    () =>
      battingTeamId === match.teams.teamA.id
        ? options.teamBPlayers
        : options.teamAPlayers,
    [battingTeamId, match.teams.teamA.id, options.teamAPlayers, options.teamBPlayers],
  );

  const bowlingTeamId =
    battingTeamId === match.teams.teamA.id
      ? match.teams.teamB?.id
      : match.teams.teamA.id;
  const battingPlayerOptions = [
    { value: "", label: "Select player" },
    ...battingTeamPlayers.map((player) => ({ value: player.id, label: player.name })),
  ];
  const bowlingPlayerOptions = [
    { value: "", label: "Select bowler" },
    ...bowlingTeamPlayers.map((player) => ({ value: player.id, label: player.name })),
  ];

  const submitHandler = form.handleSubmit(async (values) => {
    if (!bowlingTeamId) {
      return;
    }
    await onSubmit({
      battingTeamId: values.battingTeamId,
      bowlingTeamId,
      strikerId: values.strikerId,
      nonStrikerId: values.nonStrikerId,
      bowlerId: values.bowlerId,
    });
  });

  return (
    <form className="space-y-5" onSubmit={submitHandler}>
      <input type="hidden" {...form.register("battingTeamId")} />

      <div className="grid gap-4 md:grid-cols-2">
        <FormGroup label="Opening striker" error={form.formState.errors.strikerId?.message}>
          <SelectField
            options={[{ value: "", label: "Select striker" }, ...battingPlayerOptions.slice(1)]}
            disabled={!canStart || isSubmitting}
            {...form.register("strikerId")}
          />
        </FormGroup>

        <FormGroup
          label="Opening non-striker"
          error={form.formState.errors.nonStrikerId?.message}
        >
          <SelectField
            options={[{ value: "", label: "Select non-striker" }, ...battingPlayerOptions.slice(1)]}
            disabled={!canStart || isSubmitting}
            {...form.register("nonStrikerId")}
          />
        </FormGroup>
      </div>

      <FormGroup label="Opening bowler" error={form.formState.errors.bowlerId?.message}>
        <SelectField
          options={bowlingPlayerOptions}
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
          You do not have permission to start this match.
        </p>
      ) : null}

      <div className={alignSubmitRight ? "flex justify-end gap-2" : "flex gap-2"}>
        {secondaryAction}
        <Button type="submit" disabled={!canStart || isSubmitting}>
          {isSubmitting ? "Starting..." : "Start match"}
        </Button>
      </div>
    </form>
  );
};
