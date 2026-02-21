import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTournament } from "../services/tournamentsService";
import type { TournamentSummary } from "../types/tournamentTypes";
import { tournamentQueryKeys } from "../constants/tournamentQueryKeys";
import { fixturesQueryKeys } from "../../fixtures/constants/fixturesQueryKeys";

export const useDeleteTournamentMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTournament(id),
    onSuccess: (deleted) => {
      queryClient.setQueryData<TournamentSummary[]>(tournamentQueryKeys.list, (current) => {
        if (!current) return current;
        return current.filter((tournament) => tournament.id !== deleted.id);
      });

      queryClient.removeQueries({ queryKey: tournamentQueryKeys.detail(id) });
      queryClient.removeQueries({ queryKey: ["teams", id] });
      queryClient.removeQueries({ queryKey: fixturesQueryKeys.byTournamentMatches(id) });
      queryClient.removeQueries({ queryKey: fixturesQueryKeys.byTournamentFixtures(id) });
      queryClient.removeQueries({ queryKey: fixturesQueryKeys.byTournamentBracket(id) });
      queryClient.invalidateQueries({ queryKey: tournamentQueryKeys.list });
    },
  });
};
