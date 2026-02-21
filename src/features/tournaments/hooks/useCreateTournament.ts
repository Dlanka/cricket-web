import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTournament } from "../services/tournamentsService";
import type { TournamentCreateInput } from "../types/tournamentTypes";
import { tournamentQueryKeys } from "../constants/tournamentQueryKeys";

export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TournamentCreateInput) => createTournament(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tournamentQueryKeys.list });
    },
  });
};
