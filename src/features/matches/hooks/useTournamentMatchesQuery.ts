import { useQuery } from "@tanstack/react-query";
import { fetchTournamentFixtures } from "../services/matches.service";

export const useTournamentMatchesQuery = (tournamentId: string) =>
  useQuery({
    queryKey: ["fixtures", "tournament", tournamentId],
    queryFn: () => fetchTournamentFixtures(tournamentId),
    enabled: Boolean(tournamentId),
  });
