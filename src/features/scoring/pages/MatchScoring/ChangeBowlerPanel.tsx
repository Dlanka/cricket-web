import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/shared/components/card/Card";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import { normalizeApiError } from "@/shared/utils/apiErrors";
import { usePlayersByTeamQuery } from "@/features/players/hooks/usePlayersByTeamQuery";
import { useMatchRosterQuery } from "@/features/roster/hooks/useMatchRosterQuery";
import { useChangeCurrentBowlerMutation } from "../../hooks/useChangeCurrentBowlerMutation";

type Props = {
  matchId: string;
  inningsId: string;
  bowlingTeamId: string;
  currentBowlerId: string;
};

const getErrorMessage = (code?: string, fallback?: string) => {
  switch (code) {
    case "match.over_not_finished":
      return "You can change bowler only after over completes.";
    case "match.overs_completed":
      return "Innings overs completed. Bowler cannot be changed.";
    case "match.bowler_invalid":
      return "Selected player is not in bowling XI.";
    case "match.invalid_state":
      return "Match is not live.";
    default:
      return fallback || "Unable to change bowler.";
  }
};

export const ChangeBowlerPanel = ({
  matchId,
  inningsId,
  bowlingTeamId,
  currentBowlerId,
}: Props) => {
  const rosterQuery = useMatchRosterQuery(matchId);
  const playersQuery = usePlayersByTeamQuery(bowlingTeamId);
  const mutation = useChangeCurrentBowlerMutation(matchId, inningsId);
  const [selectedBowlerId, setSelectedBowlerId] = useState(currentBowlerId);

  const options = useMemo(
    () => {
      const selectedPlayingIds = rosterQuery.data?.teams
        .find((team) => team.teamId === bowlingTeamId)
        ?.players.filter((player) => player.isPlaying)
        .map((player) => player.playerId) ?? [];
      return (playersQuery.data ?? []).filter((player) =>
        selectedPlayingIds.includes(player.id),
      );
    },
    [playersQuery.data, rosterQuery.data, bowlingTeamId],
  );

  const submit = async () => {
    if (!selectedBowlerId) {
      return;
    }
    try {
      await mutation.mutateAsync(selectedBowlerId);
      toast.success("Current bowler updated.");
    } catch (error) {
      const normalized = normalizeApiError(error);
      toast.error(getErrorMessage(normalized.code, normalized.message));
    }
  };

  const normalizedError = mutation.error
    ? normalizeApiError(mutation.error)
    : null;
  const bowlerOptions = [
    { value: "", label: "Select bowler" },
    ...options.map((player) => ({
      value: player.id,
      label: `${player.fullName}${player.jerseyNumber != null ? ` (#${player.jerseyNumber})` : ""}`,
    })),
  ];

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1">
          <FormGroup label="Current bowler">
            <SelectField
              options={bowlerOptions}
              value={selectedBowlerId}
              onChange={(event) => setSelectedBowlerId(event.target.value)}
              disabled={mutation.isPending}
            />
          </FormGroup>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={
            mutation.isPending ||
            !selectedBowlerId ||
            selectedBowlerId === currentBowlerId
          }
          onClick={() => {
            void submit();
          }}
        >
          {mutation.isPending ? "Updating..." : "Change bowler"}
        </Button>
      </div>
      {normalizedError ? (
        <p className="mt-2 text-xs text-error-40">
          {getErrorMessage(normalizedError.code, normalizedError.message)}
        </p>
      ) : null}
    </Card>
  );
};
