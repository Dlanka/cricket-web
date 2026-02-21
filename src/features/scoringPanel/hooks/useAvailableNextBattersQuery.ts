import { useQuery } from "@tanstack/react-query";
import { getAvailableNextBatters } from "../services/scoringPanel.service";
import { scoringQueryKeys } from "../../scoring/constants/scoringQueryKeys";

export const useAvailableNextBattersQuery = (matchId: string, enabled = true) =>
  useQuery({
    queryKey: scoringQueryKeys.availableNextBatters(matchId),
    queryFn: () => getAvailableNextBatters(matchId),
    enabled: enabled && Boolean(matchId),
  });
