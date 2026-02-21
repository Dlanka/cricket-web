import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTournament } from "../services/tournamentsService";
import type { TournamentUpdateInput } from "../types/tournamentTypes";
import { tournamentQueryKeys } from "../constants/tournamentQueryKeys";

export const useUpdateTournamentMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TournamentUpdateInput) => updateTournament(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: tournamentQueryKeys.detail(id) });
    },
  });
};
