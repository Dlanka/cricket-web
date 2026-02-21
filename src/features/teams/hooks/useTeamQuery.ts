import { useQuery } from "@tanstack/react-query";
import { fetchTeam } from "../services/teams.service";

export const useTeamQuery = (teamId: string) =>
  useQuery({
    queryKey: ["team", teamId],
    queryFn: () => fetchTeam(teamId),
    enabled: Boolean(teamId),
  });
