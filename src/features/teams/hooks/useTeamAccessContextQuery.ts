import { useQuery } from "@tanstack/react-query";
import { getTeamAccessContext } from "@/features/teams/services/teams.service";

export const useTeamAccessContextQuery = (token: string) =>
  useQuery({
    queryKey: ["team-access", token, "context"],
    queryFn: () => getTeamAccessContext(token),
    enabled: Boolean(token),
  });
