import { StatusBadge } from "@/shared/components/status/StatusBadge";
import { MatchActions } from "../../components/MatchActions";
import type {
  MatchItem,
  TournamentBracketResponse,
} from "@/features/fixtures/types/fixtures.types";

type Props = {
  matches: MatchItem[];
  bracket?: TournamentBracketResponse;
  canEditRoster: boolean;
  canStartMatch: boolean;
};

const stageLabels: Record<string, string> = {
  LEAGUE: "League",
  R1: "Round 1",
  QF: "Quarter-final",
  SF: "Semi-final",
  FINAL: "Final",
};

const stageOrder = ["LEAGUE", "R1", "QF", "SF", "FINAL"];

const formatWinner = (match: MatchItem) => {
  if (match.status !== "COMPLETED") {
    return null;
  }
  if (match.teamB === null) {
    return `${match.teamA?.name ?? "TBD"} won (BYE)`;
  }
  const resultType =
    match.result?.type ??
    (match.result?.isNoResult ? "NO_RESULT" : null);
  if (resultType === "TIE") {
    return "Tied";
  }
  if (resultType === "NO_RESULT") {
    return "No Result";
  }
  if (match.result?.winnerTeamId) {
    const winner =
      match.result.winnerTeamId === match.teamA?.id
        ? (match.teamA?.name ?? "TBD")
        : match.result.winnerTeamId === match.teamB?.id
          ? match.teamB?.name
          : "Winner decided";
    const marginRuns =
      match.result.winByRuns != null
        ? ` by ${match.result.winByRuns} runs`
        : "";
    const marginWkts =
      match.result.winByWkts != null
        ? ` by ${match.result.winByWkts} wkts`
        : "";
    return `${winner} won${marginRuns || marginWkts}`;
  }
  return "Completed";
};

const byStageOrder = (left: string, right: string) => {
  const l = stageOrder.indexOf(left);
  const r = stageOrder.indexOf(right);
  if (l === r) return 0;
  if (l === -1) return 1;
  if (r === -1) return -1;
  return l - r;
};

export const MatchList = ({
  matches,
  bracket,
  canEditRoster,
  canStartMatch,
}: Props) => {
  const grouped = matches.reduce<Record<string, MatchItem[]>>((acc, match) => {
    if (!acc[match.stage]) {
      acc[match.stage] = [];
    }
    acc[match.stage].push(match);
    return acc;
  }, {});

  const orderedStages = stageOrder.filter((stage) => grouped[stage]?.length);
  const extraStages = Object.keys(grouped).filter(
    (stage) => !stageOrder.includes(stage),
  );
  const stages = [...orderedStages, ...extraStages];
  const renderedMatchStages = new Set(stages);
  const bracketRounds = (bracket?.rounds ?? [])
    .filter(
      (round) =>
        round.stage !== "R1" &&
        !renderedMatchStages.has(round.stage),
    )
    .sort((a, b) => {
      const stageDiff = byStageOrder(a.stage, b.stage);
      if (stageDiff !== 0) return stageDiff;
      return a.roundNumber - b.roundNumber;
    });

  return (
    <div className="space-y-6">
      {stages.length === 0 ? (
        <p className="text-sm text-neutral-40">No matches yet.</p>
      ) : null}

      {stages.map((stage) => (
        <section key={stage} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-40">
            {stageLabels[stage] ?? stage}
          </h3>
          <div className="space-y-3">
            {grouped[stage].map((match) => (
              <div
                key={match.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-90 bg-neutral-99 p-4 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.4)]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-primary-10">
                      {match.teamA?.name ?? "TBD"}
                      <span className=" font-normal px-1.5">vs</span>
                      {match.teamB?.name ?? "BYE"}
                    </p>
                    {match.teamBId == null ? (
                      <span className="inline-flex rounded-full border border-warning-80 bg-warning-95 px-2 py-0.5 text-[11px] font-semibold text-warning-30">
                        BYE
                      </span>
                    ) : null}
                    {(match.phase === "SUPER_OVER" ||
                    match.hasSuperOver ||
                    Boolean(match.superOverStatus)) ? (
                      <span className="inline-flex rounded-full border border-primary-80 bg-primary-95 px-2 py-0.5 text-[11px] font-semibold text-primary-30">
                        {match.superOverStatus
                          ? `Super Over ${match.superOverStatus}`
                          : "Super Over"}
                      </span>
                    ) : null}
                  </div>
                  {/* <p className="text-xs text-neutral-40">
                    {formatDateTime(match.scheduledAt)}
                  </p> */}
                  {formatWinner(match) ? (
                    <p className="mt-2 text-sm font-medium text-primary-50">
                      {formatWinner(match)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={match.status} />
                  <MatchActions
                    match={match}
                    tournamentId={match.tournamentId}
                    canEditRoster={canEditRoster}
                    canStartMatch={canStartMatch}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {bracketRounds.length > 0 ? (
        <section className="space-y-3">
          <div className="space-y-6">
            {bracketRounds.map((round) => (
              <section
                key={`${round.stage}-${round.roundNumber}`}
                className="space-y-3"
              >
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-40">
                  {stageLabels[round.stage] ?? round.stage}
                </h4>
                <div className="space-y-3">
                  {round.fixtures.map((fixture) => (
                    <div
                      key={`${round.stage}-${round.roundNumber}-${fixture.slot}`}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-90 bg-neutral-99 p-4 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.4)]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-primary-10">
                            {`${fixture.teamA?.name ?? "TBD"} vs ${fixture.teamB?.name ?? "TBD"}`}
                          </p>
                          {fixture.isBye ? (
                            <span className="inline-flex rounded-full border border-warning-80 bg-warning-95 px-2 py-0.5 text-[11px] font-semibold text-warning-30">
                              BYE
                            </span>
                          ) : null}
                        </div>
                        {fixture.winnerTeamId ? (
                          <p className="mt-2 text-sm font-medium text-success-40">
                            {(fixture.winnerTeamId === fixture.teamA?.id
                              ? fixture.teamA?.name
                              : fixture.teamB?.name) ?? "Winner decided"}{" "}
                            won
                          </p>
                        ) : fixture.resultType === "TIE" ? (
                          <p className="mt-2 text-sm font-medium text-primary-50">Tied</p>
                        ) : fixture.resultType === "NO_RESULT" ? (
                          <p className="mt-2 text-sm font-medium text-neutral-50">No Result</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={fixture.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
