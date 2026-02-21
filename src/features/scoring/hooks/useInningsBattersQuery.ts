import { useQuery } from "@tanstack/react-query";
import { getBatters } from "../services/scoring.service";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

export const useInningsBattersQuery = (inningsId: string) =>
  useQuery({
    queryKey: scoringQueryKeys.innings.batters(inningsId),
    queryFn: () => getBatters(inningsId),
    enabled: Boolean(inningsId),
  });
