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
  const isOverBoundary =
    currentBalls > 0 && currentBalls % ballsPerOver === 0;
  const isAwaitingBowlerChange =
    isOverBoundary && !isResolvedBoundary;

  const isBallDisplay = (display: string) => {
    const token = display.trim().toLowerCase();
    return (
      token !== "undo" &&
      token !== "retire" &&
      !token.includes("swap")
    );
  };

  const latestOverBalls = latestOver
    ? latestOver.balls.filter((ball) => isBallDisplay(ball.display))
    : [];
  const firstNonEmptyOver = data?.items?.find((over) =>
    over.balls.some((ball) => isBallDisplay(ball.display)),
  );
  const effectiveOver =
    isAwaitingBowlerChange &&
    latestOver &&
    latestOverBalls.length === 0 &&
    firstNonEmptyOver
      ? firstNonEmptyOver
      : latestOver;
  const effectiveOverBalls = effectiveOver
    ? effectiveOver.balls.filter((ball) => isBallDisplay(ball.display))
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
      token.startsWith("w+") ||
      token === "wk" ||
      token === "ro" ||
      token.includes("out");

    if (isWicket) {
      return "border-error/30 bg-error-container text-on-error-container";
    }
    if (isSix) {
      return "border-primary/40 bg-primary-container text-on-primary-container";
    }
    if (isFour) {
      return "border-success/30 bg-success-container text-on-success-container";
    }
    if (isWide || isNoBall) {
      return "border-warning/30 bg-warning-container text-on-warning-container";
    }
    return "border-outline-strong bg-surface-container-high text-on-surface-variant";
  };

  const content = (
    <>
      {isLoading ? (
        <p className="mt-3 text-sm text-on-surface-variant">Loading overs...</p>
      ) : null}
      {isError ? (
        <p className="mt-3 text-sm text-on-error-container">
          {error instanceof Error ? error.message : "Unable to load overs."}
        </p>
      ) : null}
      {effectiveOver ? (
        <div className=" bg-surface-container">
          <div className="flex items-center justify-between gap-3">
            <div className="flex w-full flex-col gap-3">
              <div className="flex w-full items-center justify-between">
                <p className="font-display text-sm font-bold uppercase tracking-wider text-on-surface-muted">
                  Over{" "}
                  {isResolvedBoundary
                    ? effectiveOver.overNumber + 1
                    : effectiveOver.overNumber}
                </p>

                <p className="font-display text-sm font-semibold uppercase tracking-wide text-on-surface">
                  <span className="text-on-primary-container">
                    {isResolvedBoundary ? 0 : effectiveOver.runsThisOver}
                  </span>{" "}
                  <span className="text-on-surface-muted">runs</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {!isResolvedBoundary
                  ? effectiveOverBalls.map((ball) => (
                      <span
                        key={ball.seq}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border font-mono text-sm font-semibold ${getChipClassName(ball.display)}`}
                      >
                        {ball.display}
                      </span>
                    ))
                  : null}
                {!isResolvedBoundary && !effectiveOverBalls.length ? (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-outline text-on-surface-muted">
                    -
                  </span>
                ) : null}
                {isResolvedBoundary ? (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-outline text-on-surface-muted">
                    -
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : !isLoading && !isError ? (
        <p className="mt-3 text-sm text-on-surface-variant">No overs yet.</p>
      ) : null}
    </>
  );

  if (embedded) {
    return content;
  }

  return <Card>{content}</Card>;
};
