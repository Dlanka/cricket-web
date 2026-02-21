import { useQuery } from "@tanstack/react-query";
import { getRoster } from "../services/roster.service";

export const useMatchRosterQuery = (matchId: string) =>
  useQuery({
    queryKey: ["roster", matchId],
    queryFn: () => getRoster(matchId),
    enabled: Boolean(matchId),
  });
