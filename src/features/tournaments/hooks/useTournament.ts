import { useQuery } from "@tanstack/react-query";
import { fetchTournamentById } from "../services/tournamentsService";
import { tournamentQueryKeys } from "../constants/tournamentQueryKeys";

export const useTournament = (id: string) =>
  useQuery({
    queryKey: tournamentQueryKeys.detail(id),
    queryFn: () => fetchTournamentById(id),
    enabled: Boolean(id),
  });
