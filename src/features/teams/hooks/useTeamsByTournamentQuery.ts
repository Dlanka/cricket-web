import { useQuery } from "@tanstack/react-query";
import { fetchTeamsByTournament } from "../services/teams.service";

export const useTeamsByTournamentQuery = (tournamentId: string) =>
  useQuery({
    queryKey: ["teams", tournamentId],
    queryFn: () => fetchTeamsByTournament(tournamentId),
    enabled: Boolean(tournamentId),
    placeholderData: [],
  });
