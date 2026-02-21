import { useQuery } from "@tanstack/react-query";
import { getOvers } from "../services/scoring.service";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

export const useInningsOversQuery = (inningsId: string, limit = 10) =>
  useQuery({
    queryKey: scoringQueryKeys.innings.overs(inningsId, limit),
    queryFn: () => getOvers(inningsId, limit),
    enabled: Boolean(inningsId),
  });
