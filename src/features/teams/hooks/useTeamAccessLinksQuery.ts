import { useQuery } from "@tanstack/react-query";
import { listTeamAccessLinks } from "@/features/teams/services/teams.service";

export const useTeamAccessLinksQuery = (teamId: string, enabled = true) =>
  useQuery({
    queryKey: ["team", teamId, "access-links"],
    queryFn: () => listTeamAccessLinks(teamId),
    enabled: Boolean(teamId) && enabled,
  });
