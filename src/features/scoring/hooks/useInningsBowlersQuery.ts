import { useQuery } from "@tanstack/react-query";
import { getBowlers } from "../services/scoring.service";
import { scoringQueryKeys } from "../constants/scoringQueryKeys";

export const useInningsBowlersQuery = (inningsId: string) =>
  useQuery({
    queryKey: scoringQueryKeys.innings.bowlers(inningsId),
    queryFn: () => getBowlers(inningsId),
    enabled: Boolean(inningsId),
  });
