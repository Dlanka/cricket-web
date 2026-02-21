import { Card } from "@/shared/components/card/Card";
import { useInningsOversQuery } from "../../hooks/useInningsOversQuery";

type Props = {
  inningsId: string;
  currentBalls: number;
  ballsPerOver: number;
  resolvedOverBoundaryBalls?: number | null;
  embedded?: boolean;
};

export const OverHistoryPanel = ({
  inningsId,
  currentBalls,
  ballsPerOver,
  resolvedOverBoundaryBalls,
  embedded = false,
}: Props) => {
  const { data, isLoading, isError, error } = useInningsOversQuery(
    inningsId,
    10,
  );
  const latestOver = data?.items?.[0];
  const isResolvedBoundary =
    resolvedOverBoundaryBalls != null &&
    resolvedOverBoundaryBalls === currentBalls &&
    currentBalls > 0 &&
    currentBalls % ballsPerOver === 0;
  const latestOverBalls = latestOver
    ? latestOver.balls.filter((ball) => {
        const token = ball.display.trim().toLowerCase();
        return token !== "undo" && !token.includes("swap");
      })
    : [];
  const getChipClassName = (display: string) => {
    const token = display.trim().toLowerCase();
    const isFour = token === "4";
    const isSix = token === "6";
    const isWide =
      token === "wd" || token === "wide" || token.startsWith("wd+");
    const isNoBall =
      token === "nb" ||
      token === "no-ball" ||
      token === "noball" ||
      token.startsWith("nb+");
    const isWicket =
      token === "w" ||
      token === "wk" ||
      token === "ro" ||
      token.includes("out");

    if (isWicket) {
      return "border-error-50 bg-error-50 text-error-100";
    }
    if (isSix) {
      return "border-success-50 bg-success-50 text-success-100";
    }
    if (isFour) {
      return "border-info-50 bg-info-50 text-info-100";
    }
    if (isWide || isNoBall) {
      return "border-warning-50 bg-warning-50 text-warning-100";
    }
    return "border-neutral-80 bg-neutral-99 text-primary-10";
  };

  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
        This over
      </p>
      {isLoading ? (
        <p className="mt-3 text-sm text-neutral-40">Loading overs...</p>
      ) : null}
      {isError ? (
        <p className="mt-3 text-sm text-error-40">
          {error instanceof Error ? error.message : "Unable to load overs."}
        </p>
      ) : null}
      {latestOver ? (
        <div className="mt-3 rounded-xl border border-neutral-90 p-3">
          <div className="flex items-center justify-between text-xs text-neutral-40">
            <span>
              Over{" "}
              {isResolvedBoundary
                ? latestOver.overNumber + 1
                : latestOver.overNumber}
            </span>
            <span>{isResolvedBoundary ? 0 : latestOver.runsThisOver} runs</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {!isResolvedBoundary
              ? latestOverBalls.map((ball) => (
                  <span
                    key={ball.seq}
                    className={`rounded-full border px-2 py-1 text-xs ${getChipClassName(ball.display)}`}
                  >
                    {ball.display}
                  </span>
                ))
              : null}
            {!isResolvedBoundary && !latestOverBalls.length ? (
              <span className="text-xs text-neutral-40">-</span>
            ) : null}
            {isResolvedBoundary ? (
              <span className="text-xs text-neutral-40">-</span>
            ) : null}
          </div>
        </div>
      ) : !isLoading && !isError ? (
        <p className="mt-3 text-sm text-neutral-40">No overs yet.</p>
      ) : null}
    </>
  );

  if (embedded) {
    return content;
  }

  return <Card>{content}</Card>;
};
