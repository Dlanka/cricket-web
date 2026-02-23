import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { Card } from "@/shared/components/card/Card";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import {
  playerCreateSchema,
  playerUpdateSchema,
  type PlayerCreateFormValues,
  type PlayerUpdateFormValues,
} from "@/features/players/schemas/players.schemas";
import type { Player } from "@/features/players/types/players.types";
import {
  BATTING_STYLE_OPTIONS,
  BOWLING_STYLE_OPTIONS,
} from "@/features/players/constants/playerStyles";
import { useTeamAccessContextQuery } from "@/features/teams/hooks/useTeamAccessContextQuery";
import { useCreateTeamAccessPlayerMutation } from "@/features/teams/hooks/useCreateTeamAccessPlayerMutation";
import { useUpdateTeamAccessPlayerMutation } from "@/features/teams/hooks/useUpdateTeamAccessPlayerMutation";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { formatDate } from "@/shared/utils/date";

const mapTeamAccessError = (error: unknown) => {
  const normalized = normalizeApiError(error);
  switch (normalized.code) {
    case "team_access.invalid_token":
      return "This link is no longer valid. Request a new team access link.";
    case "team.not_found":
      return "Team not found.";
    case "player.not_found":
      return "Player not found.";
    case "validation.failed":
      return normalized.message || "Invalid player details.";
    default:
      return normalized.message || "Unable to load team access page.";
  }
};

export const PublicTeamAccessPage = () => {
  const { token } = useParams({ from: "/team-access/$token" });
  const contextQuery = useTeamAccessContextQuery(token);
  const createPlayerMutation = useCreateTeamAccessPlayerMutation(token);
  const updatePlayerMutation = useUpdateTeamAccessPlayerMutation(token);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const createForm = useForm<PlayerCreateFormValues>({
    resolver: zodResolver(playerCreateSchema),
    defaultValues: {
      fullName: "",
      isWicketKeeper: false,
    },
  });

  const editForm = useForm<PlayerUpdateFormValues>({
    resolver: zodResolver(playerUpdateSchema),
    defaultValues: {
      fullName: "",
      isWicketKeeper: false,
    },
  });

  const onCreate = createForm.handleSubmit(async (values) => {
    try {
      await createPlayerMutation.mutateAsync(playerCreateSchema.parse(values));
      toast.success("Player added.");
      setCreateOpen(false);
      createForm.reset({ fullName: "", isWicketKeeper: false });
    } catch (error) {
      toast.error(mapTeamAccessError(error));
    }
  });

  const onEdit = editForm.handleSubmit(async (values) => {
    if (!editingPlayer) return;
    try {
      await updatePlayerMutation.mutateAsync({
        playerId: editingPlayer.id,
        payload: playerUpdateSchema.parse(values),
      });
      toast.success("Player updated.");
      setEditingPlayer(null);
    } catch (error) {
      toast.error(mapTeamAccessError(error));
    }
  });

  if (contextQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="p-6 text-sm text-neutral-40">Loading team context...</Card>
      </div>
    );
  }

  if (contextQuery.isError || !contextQuery.data) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <EmptyState
          title="Link unavailable"
          description={mapTeamAccessError(contextQuery.error)}
        />
      </div>
    );
  }

  const context = contextQuery.data;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
          Team Access
        </p>
        <h1 className="text-2xl font-semibold text-primary-10">{context.team.name}</h1>
        <p className="text-sm text-neutral-40">
          Tournament: {context.tournament.name} | {context.tournament.type} |{" "}
          {context.tournament.status}
        </p>
        <p className="text-sm text-neutral-40">
          {context.tournament.oversPerInnings} overs / {context.tournament.ballsPerOver} balls
        </p>
        <p className="text-sm text-neutral-40">
          {formatDate(context.tournament.startDate, "TBD")} -{" "}
          {formatDate(context.tournament.endDate, "TBD")}
        </p>
        <div className="pt-2">
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setCreateOpen(true)}
          >
            Add player
          </Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-3 md:hidden">
          {context.players.length === 0 ? (
            <div className="rounded-xl border border-neutral-90 px-3 py-3 text-sm text-neutral-40">
              No players yet.
            </div>
          ) : (
            context.players.map((player) => (
              <div
                key={player.id}
                className="rounded-xl border border-neutral-90 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary-20">{player.fullName}</p>
                    <p className="mt-1 text-xs text-neutral-40">
                      Jersey: {player.jerseyNumber ?? "-"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    appearance="outline"
                    color="neutral"
                    shape="square"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setEditingPlayer(player);
                      editForm.reset({
                        fullName: player.fullName,
                        jerseyNumber: player.jerseyNumber ?? undefined,
                        battingStyle: player.battingStyle ?? undefined,
                        bowlingStyle: player.bowlingStyle ?? undefined,
                        isWicketKeeper: player.isWicketKeeper,
                      });
                    }}
                    title="Edit player"
                    aria-label={`Edit ${player.fullName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border border-neutral-90 md:block">
          <table className="w-full min-w-90 text-sm">
            <thead>
              <tr className="bg-neutral-98 text-xs uppercase tracking-[0.12em] text-neutral-40">
                <th className="px-3 py-2 text-left">Player</th>
                <th className="w-20 px-3 py-2 text-left">Jersey</th>
                <th className="w-20 px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {context.players.length === 0 ? (
                <tr className="border-t border-neutral-90">
                  <td colSpan={3} className="px-3 py-3 text-neutral-40">
                    No players yet.
                  </td>
                </tr>
              ) : (
                context.players.map((player) => (
                  <tr key={player.id} className="border-t border-neutral-90">
                    <td className="px-3 py-2 font-medium text-primary-20">{player.fullName}</td>
                    <td className="px-3 py-2">{player.jerseyNumber ?? "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        size="sm"
                        appearance="outline"
                        color="neutral"
                        shape="square"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditingPlayer(player);
                          editForm.reset({
                            fullName: player.fullName,
                            jerseyNumber: player.jerseyNumber ?? undefined,
                            battingStyle: player.battingStyle ?? undefined,
                            bowlingStyle: player.bowlingStyle ?? undefined,
                            isWicketKeeper: player.isWicketKeeper,
                          });
                        }}
                        title="Edit player"
                        aria-label={`Edit ${player.fullName}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <RightSideModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add player"
        description="Add a player to this team."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              appearance="outline"
              color="neutral"
              onClick={() => setCreateOpen(false)}
              disabled={createPlayerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void onCreate()}
              disabled={createPlayerMutation.isPending}
            >
              {createPlayerMutation.isPending ? "Saving..." : "Add"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <FormGroup label="Player name" error={createForm.formState.errors.fullName?.message}>
            <InputField type="text" {...createForm.register("fullName")} />
          </FormGroup>
          <FormGroup label="Jersey number" error={createForm.formState.errors.jerseyNumber?.message}>
            <InputField
              type="number"
              {...createForm.register("jerseyNumber", {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
            />
          </FormGroup>
          <FormGroup label="Batting style" error={createForm.formState.errors.battingStyle?.message}>
            <SelectField
              options={[
                { label: "Optional", value: "" },
                ...BATTING_STYLE_OPTIONS,
              ]}
              {...createForm.register("battingStyle", {
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
            />
          </FormGroup>
          <FormGroup label="Bowling style" error={createForm.formState.errors.bowlingStyle?.message}>
            <SelectField
              options={[
                { label: "Optional", value: "" },
                ...BOWLING_STYLE_OPTIONS,
              ]}
              {...createForm.register("bowlingStyle", {
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
            />
          </FormGroup>
          <label className="flex items-center gap-2 text-sm text-neutral-40">
            <input type="checkbox" {...createForm.register("isWicketKeeper")} />
            Wicket keeper
          </label>
        </div>
      </RightSideModal>

      <RightSideModal
        isOpen={Boolean(editingPlayer)}
        onClose={() => setEditingPlayer(null)}
        title="Edit player"
        description="Update player details."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              appearance="outline"
              color="neutral"
              onClick={() => setEditingPlayer(null)}
              disabled={updatePlayerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void onEdit()}
              disabled={updatePlayerMutation.isPending}
            >
              {updatePlayerMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <FormGroup label="Player name" error={editForm.formState.errors.fullName?.message}>
            <InputField type="text" {...editForm.register("fullName")} />
          </FormGroup>
          <FormGroup label="Jersey number" error={editForm.formState.errors.jerseyNumber?.message}>
            <InputField
              type="number"
              {...editForm.register("jerseyNumber", {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
            />
          </FormGroup>
          <FormGroup label="Batting style" error={editForm.formState.errors.battingStyle?.message}>
            <SelectField
              options={[
                { label: "Optional", value: "" },
                ...BATTING_STYLE_OPTIONS,
              ]}
              {...editForm.register("battingStyle", {
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
            />
          </FormGroup>
          <FormGroup label="Bowling style" error={editForm.formState.errors.bowlingStyle?.message}>
            <SelectField
              options={[
                { label: "Optional", value: "" },
                ...BOWLING_STYLE_OPTIONS,
              ]}
              {...editForm.register("bowlingStyle", {
                setValueAs: (value) => (value === "" ? undefined : value),
              })}
            />
          </FormGroup>
          <label className="flex items-center gap-2 text-sm text-neutral-40">
            <input type="checkbox" {...editForm.register("isWicketKeeper")} />
            Wicket keeper
          </label>
        </div>
      </RightSideModal>
    </div>
  );
};
