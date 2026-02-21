import { useState } from "react";
import { Card } from "@/shared/components/card/Card";
import { Button } from "@/components/ui/button/Button";
import { useInningsEventsInfiniteQuery } from "../../hooks/useInningsEventsInfiniteQuery";

type Props = {
  inningsId: string;
};

export const BallFeedPanel = ({ inningsId }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInningsEventsInfiniteQuery(inningsId);

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-40">
          Ball feed
        </p>
        <Button
          type="button"
          appearance="outline"
          color="neutral"
          size="sm"
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? "Hide feed" : "Show feed"}
        </Button>
      </div>
      {!isExpanded ? (
        <p className="mt-3 text-sm text-neutral-40">
          Hidden by default for focused scoring.
        </p>
      ) : null}
      {!isExpanded ? null : (
        <>
      {isLoading ? <p className="mt-3 text-sm text-neutral-40">Loading events...</p> : null}
      {isError ? (
        <p className="mt-3 text-sm text-error-40">
          {error instanceof Error ? error.message : "Unable to load events."}
        </p>
      ) : null}
      {items.length ? (
        <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-auto pr-1">
          {items.map((event) => (
            <div key={event.id} className="rounded-xl border border-neutral-90 p-3">
              <div className="flex items-center justify-between text-xs text-neutral-40">
                <span>#{event.seq}</span>
                <span>{event.type}</span>
              </div>
              <p className="mt-1 text-sm text-primary-10">{event.summary}</p>
            </div>
          ))}
          {hasNextPage ? (
            <Button
              type="button"
              appearance="outline"
              color="neutral"
              size="sm"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          ) : null}
        </div>
      ) : !isLoading && !isError ? (
        <p className="mt-3 text-sm text-neutral-40">No events yet.</p>
      ) : null}
        </>
      )}
    </Card>
  );
};
