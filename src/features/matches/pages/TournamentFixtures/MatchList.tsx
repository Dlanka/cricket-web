import { formatDateTime } from "@/shared/utils/date";
import type { MatchSummary } from "../../types/matches.types";

type GroupedMatches = Record<string, MatchSummary[]>;

type Props = {
  groups: GroupedMatches;
};

const stageLabels: Record<string, string> = {
  LEAGUE: "League",
  R1: "Round 1",
  SF: "Semi-final",
  FINAL: "Final",
};

export const MatchList = ({ groups }: Props) => {
  const stageOrder = ["LEAGUE", "R1", "SF", "FINAL"];
  const orderedStages = stageOrder.filter((stage) => groups[stage]?.length);
  const extraStages = Object.keys(groups).filter(
    (stage) => !stageOrder.includes(stage),
  );
  const stages = [...orderedStages, ...extraStages];

  return (
    <div className="space-y-6">
      {stages.map((stage) => (
        <section key={stage} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-on-surface-muted">
            {stageLabels[stage] ?? stage}
          </h3>
          <div className="space-y-3">
            {groups[stage].map((match) => (
              <div
                key={match.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline bg-surface-container p-4 shadow-surface-lg"
              >
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {match.homeTeamName || "TBD"} vs{" "}
                    {match.awayTeamName || "TBD"}
                  </p>
                  <p className="text-xs text-on-surface-muted">
                    {formatDateTime(match.scheduledAt)}
                  </p>
                </div>
                {match.matchNumber ? (
                  <span className="rounded-full border border-outline bg-surface-container px-3 py-1 text-xs text-on-surface-muted">
                    Match {match.matchNumber}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};



