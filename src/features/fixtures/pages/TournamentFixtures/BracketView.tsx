import { Link } from "@tanstack/react-router";
import { StatusPill, type StatusPillVariant } from "@/shared/components/badge/StatusPill";
import type { TournamentBracketResponse } from "../../types/fixtures.types";

type Props = {
  bracket: TournamentBracketResponse;
  tournamentId: string;
};

const stageLabels: Record<string, string> = {
  R1: "Round 1",
  QF: "Quarter-final",
  SF: "Semi-final",
  FINAL: "Final",
};

const stageOrder = ["R1", "QF", "SF", "FINAL"];

const orderedRounds = (rounds: TournamentBracketResponse["rounds"]) =>
  [...rounds].sort((a, b) => {
    const ai = stageOrder.indexOf(a.stage);
    const bi = stageOrder.indexOf(b.stage);
    if (ai === bi) return a.roundNumber - b.roundNumber;
    return ai - bi;
  });

const bracketStatusVariantMap: Record<string, StatusPillVariant> = {
  SCHEDULED: "warning",
  LIVE: "info",
  COMPLETED: "success",
  TBD: "neutral",
};

export const BracketView = ({ bracket, tournamentId }: Props) => {
  const rounds = orderedRounds(bracket.rounds);

  if (rounds.length === 0) {
    return (
      <div className="rounded-2xl border border-outline bg-surface-container p-6 text-sm text-on-surface-muted">
        Knockout bracket is not available yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-start gap-4">
        {rounds.map((round) => (
          <section
            key={`${round.stage}-${round.roundNumber}`}
            className="w-72 shrink-0 space-y-3"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted">
              {stageLabels[round.stage] ?? round.stage}
            </h3>

            <div className="space-y-3">
              {round.fixtures.map((fixture) => {
                const isPlaceholder = fixture.isPlaceholder;
                const teamALabel =
                  fixture.teamA?.shortName || fixture.teamA?.name || "TBD";
                const teamBLabel =
                  fixture.teamB?.shortName || fixture.teamB?.name || "TBD";

                return (
                  <div
                    key={`${round.stage}-${round.roundNumber}-${fixture.slot}`}
                    className={`rounded-2xl border p-4 text-sm ${
                      isPlaceholder
                        ? "border-outline bg-surface-container text-on-surface-muted"
                        : "border-outline bg-surface-container text-on-surface"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-muted">
                        Slot {fixture.slot}
                      </span>
                      <StatusPill
                        variant={bracketStatusVariantMap[fixture.status] ?? "neutral"}
                        size="xs"
                      >
                        {fixture.status}
                      </StatusPill>
                    </div>

                    <div className="space-y-1">
                      <p
                        className={`rounded-md px-2 py-1 ${
                          fixture.winnerTeamId &&
                          fixture.teamA?.id === fixture.winnerTeamId
                            ? "bg-success-container text-on-success-container"
                            : ""
                        }`}
                      >
                        {teamALabel}
                      </p>
                      <p
                        className={`rounded-md px-2 py-1 ${
                          fixture.winnerTeamId &&
                          fixture.teamB?.id === fixture.winnerTeamId
                            ? "bg-success-container text-on-success-container"
                            : ""
                        }`}
                      >
                        {teamBLabel}
                      </p>
                    </div>

                    {fixture.isBye ? (
                      <StatusPill variant="warning" size="xs" className="mt-2">
                        BYE
                      </StatusPill>
                    ) : null}

                    {!fixture.isBye && fixture.resultType === "TIE" ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">
                        Tied
                      </p>
                    ) : null}
                    {!fixture.isBye && fixture.resultType === "NO_RESULT" ? (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-on-surface-muted">
                        No Result
                      </p>
                    ) : null}

                    {!isPlaceholder && fixture.matchId ? (
                      <div className="mt-3">
                        <Link
                          to="/tournaments/$tournamentId/matches/$matchId"
                          params={{ tournamentId, matchId: fixture.matchId }}
                          className="text-xs font-semibold text-on-primary-container hover:text-on-surface"
                        >
                          Open match
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};



