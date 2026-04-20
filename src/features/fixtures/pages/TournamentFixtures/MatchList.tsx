import { MatchActions } from "../../components/MatchActions";
import {
  StatusPill,
  type StatusPillVariant,
} from "@/shared/components/badge/StatusPill";
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

const statusPillVariantMap: Record<string, StatusPillVariant> = {
  SCHEDULED: "warning",
  LIVE: "info",
  COMPLETED: "success",
  TBD: "neutral",
};

const formatStatusLabel = (status: string) => status.replaceAll("_", " ");

const formatWinner = (match: MatchItem) => {
  if (match.status !== "COMPLETED") {
    return null;
  }
  if (match.teamB === null) {
    return `${match.teamA?.name ?? "TBD"} won (BYE)`;
  }
  const resultType =
    match.result?.type ?? (match.result?.isNoResult ? "NO_RESULT" : null);
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
      (round) => round.stage !== "R1" && !renderedMatchStages.has(round.stage),
    )
    .sort((a, b) => {
      const stageDiff = byStageOrder(a.stage, b.stage);
      if (stageDiff !== 0) return stageDiff;
      return a.roundNumber - b.roundNumber;
    });

  return (
    <div className="space-y-6">
      {stages.length === 0 ? (
        <p className="text-sm text-on-surface-muted">No matches yet.</p>
      ) : null}

      {stages.map((stage) => (
        <section key={stage} className="space-y-3">
          <div className="flex items-center justify-between gap-3  pb-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-on-surface-subtle">
              {stageLabels[stage] ?? stage}
            </h3>
            <span className="flex-1 border-b border-outline-variant block"></span>
            <StatusPill variant="warning" size="sm">
              {grouped[stage].length}{" "}
              {grouped[stage].length === 1 ? "match" : "matches"}
            </StatusPill>
          </div>
          <div className="space-y-3">
            {grouped[stage].map((match) => (
              <div
                key={match.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline bg-surface-container px-4 py-3 shadow-surface-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-md tracking-wide font-bold text-on-surface">
                      {match.teamA?.name ?? "TBD"}{" "}
                      <span className="px-1.5 font-body text-sm font-medium text-on-surface-subtle">
                        vs
                      </span>{" "}
                      {match.teamB?.name ?? "BYE"}
                    </p>
                    {match.teamBId == null ? (
                      <StatusPill variant="warning" size="xs">
                        BYE
                      </StatusPill>
                    ) : null}
                    {match.phase === "SUPER_OVER" ||
                    match.hasSuperOver ||
                    Boolean(match.superOverStatus) ? (
                      <StatusPill variant="info" size="xs">
                        {match.superOverStatus
                          ? `Super Over ${match.superOverStatus}`
                          : "Super Over"}
                      </StatusPill>
                    ) : null}
                  </div>
                  {/* <p className="text-xs text-on-surface-muted">
                    {formatDateTime(match.scheduledAt)}
                  </p> */}
                  {formatWinner(match) ? (
                    <p className="mt-1 text-xs font-display tracking-wider font-medium text-on-primary-container">
                      {formatWinner(match)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill
                    variant={statusPillVariantMap[match.status] ?? "warning"}
                    size="sm"
                  >
                    {formatStatusLabel(match.status)}
                  </StatusPill>
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
                <div className="flex items-center justify-between gap-3  pb-3">
                  <h4 className="font-display text-xs font-bold uppercase tracking-widest text-on-surface-subtle">
                    {stageLabels[round.stage] ?? round.stage}
                  </h4>
                  <span className="flex-1 border-b border-outline-variant block"></span>
                  <StatusPill variant="neutral" size="sm">
                    {round.fixtures.length}{" "}
                    {round.fixtures.length === 1 ? "match" : "matches"}
                  </StatusPill>
                </div>
                <div className="space-y-3">
                  {round.fixtures.map((fixture) => (
                    <div
                      key={`${round.stage}-${round.roundNumber}-${fixture.slot}`}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline bg-surface-container px-4 py-3 shadow-surface-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display text-md font-semibold tracking-wide text-on-surface">
                            {fixture.teamA?.name ?? "TBD"}{" "}
                            <span className="px-1.5 font-body text-sm font-medium text-on-surface-subtle">
                              vs
                            </span>{" "}
                            {fixture.teamB?.name ?? "TBD"}
                          </p>
                          {fixture.isBye ? (
                            <StatusPill variant="warning" size="xs">
                              BYE
                            </StatusPill>
                          ) : null}
                        </div>
                        {fixture.winnerTeamId ? (
                          <p className="mt-2 text-sm font-medium text-on-success-container">
                            {(fixture.winnerTeamId === fixture.teamA?.id
                              ? fixture.teamA?.name
                              : fixture.teamB?.name) ?? "Winner decided"}{" "}
                            won
                          </p>
                        ) : fixture.resultType === "TIE" ? (
                          <p className="mt-2 text-sm font-medium text-on-primary-container">
                            Tied
                          </p>
                        ) : fixture.resultType === "NO_RESULT" ? (
                          <p className="mt-2 text-sm font-medium text-on-surface-subtle">
                            No Result
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill
                          variant={statusPillVariantMap[fixture.status] ?? "neutral"}
                          size="sm"
                        >
                          {formatStatusLabel(fixture.status)}
                        </StatusPill>
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
