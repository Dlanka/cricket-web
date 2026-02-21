import { Card } from "@/shared/components/card/Card";
import type { MatchScoreResponse } from "@/features/scoring/types/scoring.types";

type Props = {
  isLoading: boolean;
  score?: MatchScoreResponse;
};

export const MatchCenterLiveContextCard = ({ isLoading, score }: Props) => (
  <Card>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
      Live score context
    </p>
    {isLoading ? (
      <p className="mt-2 text-sm text-neutral-40">Loading score context...</p>
    ) : score ? (
      <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-xl border border-neutral-90 bg-neutral-99 p-3">
          <p className="text-xs text-neutral-40">Score</p>
          <p className="text-base font-semibold text-primary-10">
            {score.score.runs}/{score.score.wickets}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-90 bg-neutral-99 p-3">
          <p className="text-xs text-neutral-40">Overs</p>
          <p className="text-base font-semibold text-primary-10">{score.score.overs}</p>
        </div>
        <div className="rounded-xl border border-neutral-90 bg-neutral-99 p-3">
          <p className="text-xs text-neutral-40">Innings</p>
          <p className="text-base font-semibold text-primary-10">{score.inningsId}</p>
        </div>
      </div>
    ) : (
      <p className="mt-2 text-sm text-neutral-40">No live score context found.</p>
    )}
  </Card>
);
