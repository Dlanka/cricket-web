import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import type { PlayerOption } from "../hooks/useMatchCenterPage";
import type { StartSuperOverRequest } from "@/features/matches/types/matches.types";

const schema = z.object({
  teamAStrikerId: z.string().min(1, "Select Team A striker."),
  teamANonStrikerId: z.string().min(1, "Select Team A non-striker."),
  teamABowlerId: z.string().min(1, "Select Team A bowler."),
  teamBStrikerId: z.string().min(1, "Select Team B striker."),
  teamBNonStrikerId: z.string().min(1, "Select Team B non-striker."),
  teamBBowlerId: z.string().min(1, "Select Team B bowler."),
});

type FormValues = z.infer<typeof schema>;

type TeamInfo = {
  id: string;
  name: string;
  players: PlayerOption[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  teamA: TeamInfo;
  teamB: TeamInfo;
  teamABattingFirst: boolean;
  canDetermineBattingOrder: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  fieldErrors?: Partial<
    Record<
      | "teamA.strikerId"
      | "teamA.nonStrikerId"
      | "teamA.bowlerId"
      | "teamB.strikerId"
      | "teamB.nonStrikerId"
      | "teamB.bowlerId",
      string
    >
  >;
  onRefreshRoster?: () => Promise<void>;
  isRefreshingRoster?: boolean;
  onSubmit: (payload: StartSuperOverRequest) => Promise<boolean>;
};

const toOptions = (players: PlayerOption[], placeholder: string) => [
  { label: placeholder, value: "" },
  ...players.map((player) => ({ label: player.name, value: player.id })),
];

export const StartSuperOverModal = ({
  isOpen,
  onClose,
  teamA,
  teamB,
  teamABattingFirst,
  canDetermineBattingOrder,
  isSubmitting,
  errorMessage,
  fieldErrors,
  onRefreshRoster,
  isRefreshingRoster = false,
  onSubmit,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      teamAStrikerId: "",
      teamANonStrikerId: "",
      teamABowlerId: "",
      teamBStrikerId: "",
      teamBNonStrikerId: "",
      teamBBowlerId: "",
    },
  });

  const teamAOptions = useMemo(
    () => ({
      striker: toOptions(teamA.players, "Select striker"),
      nonStriker: toOptions(teamA.players, "Select non-striker"),
      bowler: toOptions(teamB.players, "Select opposition bowler"),
    }),
    [teamA.players, teamB.players],
  );
  const teamBOptions = useMemo(
    () => ({
      striker: toOptions(teamB.players, "Select striker"),
      nonStriker: toOptions(teamB.players, "Select non-striker"),
      bowler: toOptions(teamA.players, "Select opposition bowler"),
    }),
    [teamB.players, teamA.players],
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    form.clearErrors();
    if (!fieldErrors) return;
    const mappings: Array<[keyof FormValues, string | undefined]> = [
      ["teamAStrikerId", fieldErrors["teamA.strikerId"]],
      ["teamANonStrikerId", fieldErrors["teamA.nonStrikerId"]],
      ["teamABowlerId", fieldErrors["teamA.bowlerId"]],
      ["teamBStrikerId", fieldErrors["teamB.strikerId"]],
      ["teamBNonStrikerId", fieldErrors["teamB.nonStrikerId"]],
      ["teamBBowlerId", fieldErrors["teamB.bowlerId"]],
    ];
    for (const [fieldName, message] of mappings) {
      if (message) {
        form.setError(fieldName, { type: "server", message });
      }
    }
  }, [fieldErrors, form]);

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Start Super Over"
      description="Select batting order and opening players."
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            appearance="outline"
            color="neutral"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !canDetermineBattingOrder}
            onClick={() =>
              void form.handleSubmit(async (values) => {
                const teamAIds = new Set(teamA.players.map((player) => player.id));
                const teamBIds = new Set(teamB.players.map((player) => player.id));
                if (!teamAIds.has(values.teamAStrikerId)) {
                  form.setError("teamAStrikerId", {
                    type: "validate",
                    message: "Player not in Playing XI for this team.",
                  });
                  return;
                }
                if (!teamAIds.has(values.teamANonStrikerId)) {
                  form.setError("teamANonStrikerId", {
                    type: "validate",
                    message: "Player not in Playing XI for this team.",
                  });
                  return;
                }
                if (!teamBIds.has(values.teamABowlerId)) {
                  form.setError("teamABowlerId", {
                    type: "validate",
                    message: "Selected bowler must belong to opposition Playing XI.",
                  });
                  return;
                }
                if (!teamBIds.has(values.teamBStrikerId)) {
                  form.setError("teamBStrikerId", {
                    type: "validate",
                    message: "Player not in Playing XI for this team.",
                  });
                  return;
                }
                if (!teamBIds.has(values.teamBNonStrikerId)) {
                  form.setError("teamBNonStrikerId", {
                    type: "validate",
                    message: "Player not in Playing XI for this team.",
                  });
                  return;
                }
                if (!teamAIds.has(values.teamBBowlerId)) {
                  form.setError("teamBBowlerId", {
                    type: "validate",
                    message: "Selected bowler must belong to opposition Playing XI.",
                  });
                  return;
                }
                if (values.teamAStrikerId === values.teamANonStrikerId) {
                  form.setError("teamANonStrikerId", {
                    type: "validate",
                    message: "Striker and non-striker must be different.",
                  });
                  return;
                }
                if (values.teamBStrikerId === values.teamBNonStrikerId) {
                  form.setError("teamBNonStrikerId", {
                    type: "validate",
                    message: "Striker and non-striker must be different.",
                  });
                  return;
                }
                const success = await onSubmit({
                  teamA: {
                    battingFirst: teamABattingFirst,
                    strikerId: values.teamAStrikerId,
                    nonStrikerId: values.teamANonStrikerId,
                    bowlerId: values.teamABowlerId,
                  },
                  teamB: {
                    strikerId: values.teamBStrikerId,
                    nonStrikerId: values.teamBNonStrikerId,
                    bowlerId: values.teamBBowlerId,
                  },
                });
                if (success) handleClose();
              })()
            }
          >
            {isSubmitting ? "Starting..." : "Start Super Over"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <FormGroup
          label="Batting first (auto)"
        >
          <div className="rounded-xl border border-neutral-90 bg-neutral-99 px-3 py-2 text-sm font-semibold text-primary-10">
            {teamABattingFirst ? teamA.name : teamB.name}
          </div>
          <p className="mt-1 text-xs text-neutral-40">
            Team that batted second in regular match bats first in Super Over.
          </p>
        </FormGroup>

        <div className="grid gap-3 md:grid-cols-2">
          <FormGroup label={`${teamA.name} striker`} error={form.formState.errors.teamAStrikerId?.message}>
            <SelectField options={teamAOptions.striker} {...form.register("teamAStrikerId")} />
          </FormGroup>
          <FormGroup label={`${teamA.name} non-striker`} error={form.formState.errors.teamANonStrikerId?.message}>
            <SelectField options={teamAOptions.nonStriker} {...form.register("teamANonStrikerId")} />
          </FormGroup>
          <FormGroup
            label={`${teamA.name} bowler`}
            hint="Bowler (from opposition XI)"
            error={form.formState.errors.teamABowlerId?.message}
          >
            <SelectField options={teamAOptions.bowler} {...form.register("teamABowlerId")} />
          </FormGroup>
          <div />
          <FormGroup label={`${teamB.name} striker`} error={form.formState.errors.teamBStrikerId?.message}>
            <SelectField options={teamBOptions.striker} {...form.register("teamBStrikerId")} />
          </FormGroup>
          <FormGroup label={`${teamB.name} non-striker`} error={form.formState.errors.teamBNonStrikerId?.message}>
            <SelectField options={teamBOptions.nonStriker} {...form.register("teamBNonStrikerId")} />
          </FormGroup>
          <FormGroup
            label={`${teamB.name} bowler`}
            hint="Bowler (from opposition XI)"
            error={form.formState.errors.teamBBowlerId?.message}
          >
            <SelectField options={teamBOptions.bowler} {...form.register("teamBBowlerId")} />
          </FormGroup>
        </div>

        {!canDetermineBattingOrder ? (
          <div className="rounded-xl border border-warning-80 bg-warning-95 px-3 py-2 text-xs text-warning-30">
            Unable to determine regular batting order. Refresh match details and try again.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-xl border border-error-80 bg-error-95 px-3 py-2 text-xs text-error-40">
            {errorMessage}
          </div>
        ) : null}
        {errorMessage ? (
          <div className="flex justify-end">
            <Button
              type="button"
              appearance="outline"
              color="neutral"
              size="sm"
              onClick={() => void onRefreshRoster?.()}
              disabled={!onRefreshRoster || isRefreshingRoster}
            >
              {isRefreshingRoster ? "Refreshing..." : "Refresh roster"}
            </Button>
          </div>
        ) : null}
      </div>
    </RightSideModal>
  );
};
