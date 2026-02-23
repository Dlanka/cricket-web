import { useQuery } from "@tanstack/react-query";
import { getTeamAccessCurrentShare } from "@/features/teams/services/teams.service";

export const useTeamAccessCurrentShareQuery = (teamId: string, enabled = true) =>
  useQuery({
    queryKey: ["team", teamId, "access-link-current"],
    queryFn: () => getTeamAccessCurrentShare(teamId),
    enabled: Boolean(teamId) && enabled,
  });
