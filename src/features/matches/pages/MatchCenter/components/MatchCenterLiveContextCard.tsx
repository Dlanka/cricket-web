import { Card } from "@/shared/components/card/Card";
import type { MatchScoreResponse } from "@/features/scoring/types/scoring.types";

type Props = {
  isLoading: boolean;
  score?: MatchScoreResponse;
};

export const MatchCenterLiveContextCard = ({ isLoading, score }: Props) => (
  <Card>
    <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-muted">
      Live score context
    </p>
    {isLoading ? (
      <p className="mt-2 text-sm text-on-surface-muted">Loading score context...</p>
    ) : score ? (
      <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-xl border border-outline bg-surface-container p-3">
          <p className="text-xs text-on-surface-muted">Score</p>
          <p className="text-base font-semibold text-on-surface">
            {score.score.runs}/{score.score.wickets}
          </p>
        </div>
        <div className="rounded-xl border border-outline bg-surface-container p-3">
          <p className="text-xs text-on-surface-muted">Overs</p>
          <p className="text-base font-semibold text-on-surface">{score.score.overs}</p>
        </div>
        <div className="rounded-xl border border-outline bg-surface-container p-3">
          <p className="text-xs text-on-surface-muted">Innings</p>
          <p className="text-base font-semibold text-on-surface">{score.inningsId}</p>
        </div>
      </div>
    ) : (
      <p className="mt-2 text-sm text-on-surface-muted">No live score context found.</p>
    )}
  </Card>
);


