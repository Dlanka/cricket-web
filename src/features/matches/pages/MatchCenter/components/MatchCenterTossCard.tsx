import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { SelectField } from "@/components/ui/form/SelectField";
import { Card } from "@/shared/components/card/Card";
import type {
  MatchDetail,
  SetMatchTossRequest,
} from "@/features/matches/types/matches.types";

type Props = {
  match: MatchDetail;
  tossError: string | null;
  isTossEditable: boolean;
  isTossSubmitting: boolean;
  onSaveToss: (payload: SetMatchTossRequest) => Promise<boolean>;
  onNext?: () => void;
};

export const MatchCenterTossCard = ({
  match,
  tossError,
  isTossEditable,
  isTossSubmitting,
  onSaveToss,
  onNext,
}: Props) => {
  const [wonByTeamId, setWonByTeamId] = useState(
    match.toss?.wonByTeamId ?? match.teams.teamA.id,
  );
  const [decision, setDecision] = useState<"BAT" | "BOWL">(
    match.toss?.decision ?? "BAT",
  );

  useEffect(() => {
    setWonByTeamId(match.toss?.wonByTeamId ?? match.teams.teamA.id);
    setDecision(match.toss?.decision ?? "BAT");
  }, [match.toss?.wonByTeamId, match.toss?.decision, match.teams.teamA.id]);

  const tossWinnerOptions = [
    { label: match.teams.teamA.name, value: match.teams.teamA.id },
    ...(match.teams.teamB
      ? [{ label: match.teams.teamB.name, value: match.teams.teamB.id }]
      : []),
  ];

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
        Toss
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FormGroup label="Who won toss?">
          <SelectField
            options={tossWinnerOptions}
            disabled={!isTossEditable || isTossSubmitting}
            value={wonByTeamId}
            onChange={(event) => setWonByTeamId(event.target.value)}
          />
        </FormGroup>
        <FormGroup label="Decision">
          <SelectField
            options={[
              { label: "Bat", value: "BAT" },
              { label: "Bowl", value: "BOWL" },
            ]}
            disabled={!isTossEditable || isTossSubmitting}
            value={decision}
            onChange={(event) => setDecision(event.target.value as "BAT" | "BOWL")}
          />
        </FormGroup>
      </div>

      {match.toss ? (
        <p className="mt-3 text-xs text-neutral-40">
          Saved toss:{" "}
          {match.toss.wonByTeamId === match.teams.teamA.id
            ? match.teams.teamA.name
            : match.teams.teamB?.name ?? "Team"}{" "}
          won the toss and chose to {match.toss.decision === "BAT" ? "bat" : "bowl"}.
        </p>
      ) : null}

      {tossError ? (
        <div className="mt-3 rounded-xl border border-error-80 bg-error-95 px-3 py-2 text-xs text-error-40">
          {tossError}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={!isTossEditable || isTossSubmitting}
          onClick={() =>
            void (async () => {
              const isSaved = await onSaveToss({ wonByTeamId, decision });
              if (isSaved) {
                onNext?.();
              }
            })()
          }
        >
          {isTossSubmitting ? "Saving..." : "Next"}
        </Button>
      </div>
    </Card>
  );
};
