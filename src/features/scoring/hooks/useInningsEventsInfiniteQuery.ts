import { useInfiniteQuery } from "@tanstack/react-query";
import { getEvents } from "../services/scoring.service";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

export const useInningsEventsInfiniteQuery = (inningsId: string) =>
  useInfiniteQuery({
    queryKey: scoringQueryKeys.innings.events(inningsId),
    queryFn: ({ pageParam }) => getEvents(inningsId, pageParam, 30),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(inningsId),
  });
