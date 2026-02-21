import { useQuery } from "@tanstack/react-query";
import { fetchPlayersByTeam } from "../services/players.service";

export const usePlayersByTeamQuery = (teamId: string) =>
  useQuery({
    queryKey: ["players", teamId],
    queryFn: () => fetchPlayersByTeam(teamId),
    enabled: Boolean(teamId),
  });
