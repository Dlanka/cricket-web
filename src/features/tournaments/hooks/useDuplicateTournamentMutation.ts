import { useMutation, useQueryClient } from "@tanstack/react-query";
import { duplicateTournament } from "../services/tournamentsService";
import { tournamentQueryKeys } from "../constants/tournamentQueryKeys";

export const useDuplicateTournamentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateTournament(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tournamentQueryKeys.list });
    },
  });
};
