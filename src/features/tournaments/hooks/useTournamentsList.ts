import { useQuery } from "@tanstack/react-query";
import { fetchTournaments } from "../services/tournamentsService";
import { tournamentQueryKeys } from "../constants/tournamentQueryKeys";

export const useTournamentsList = () =>
  useQuery({
    queryKey: tournamentQueryKeys.list,
    queryFn: fetchTournaments,
  });
