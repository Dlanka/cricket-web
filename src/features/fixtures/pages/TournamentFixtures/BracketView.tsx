import { Link } from "@tanstack/react-router";
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

export const BracketView = ({ bracket, tournamentId }: Props) => {
  const rounds = orderedRounds(bracket.rounds);

  if (rounds.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-90 bg-neutral-99 p-6 text-sm text-neutral-40">
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
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-40">
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
                        ? "border-neutral-90 bg-neutral-98 text-neutral-40"
                        : "border-neutral-90 bg-neutral-99 text-primary-10"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-40">
                        Slot {fixture.slot}
                      </span>
                      <span className="rounded-full border border-neutral-90 px-2 py-0.5 text-[11px] font-semibold text-neutral-40">
                        {fixture.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p
                        className={`rounded-md px-2 py-1 ${
                          fixture.winnerTeamId &&
                          fixture.teamA?.id === fixture.winnerTeamId
                            ? "bg-success-95 text-success-30"
                            : ""
                        }`}
                      >
                        {teamALabel}
                      </p>
                      <p
                        className={`rounded-md px-2 py-1 ${
                          fixture.winnerTeamId &&
                          fixture.teamB?.id === fixture.winnerTeamId
                            ? "bg-success-95 text-success-30"
                            : ""
                        }`}
                      >
                        {teamBLabel}
                      </p>
                    </div>

                    {fixture.isBye ? (
                      <p className="mt-2 inline-flex rounded-full border border-warning-80 bg-warning-95 px-2 py-0.5 text-[11px] font-semibold text-warning-30">
                        BYE
                      </p>
                    ) : null}

                    {!isPlaceholder && fixture.matchId ? (
                      <div className="mt-3">
                        <Link
                          to="/tournaments/$tournamentId/matches/$matchId"
                          params={{ tournamentId, matchId: fixture.matchId }}
                          className="text-xs font-semibold text-primary-20 hover:text-primary-10"
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
