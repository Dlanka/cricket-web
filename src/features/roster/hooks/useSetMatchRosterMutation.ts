import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setRoster } from "../services/roster.service";
import type { SetRosterRequest } from "../types/roster.types";

export const useSetMatchRosterMutation = (matchId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetRosterRequest) => setRoster(matchId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["roster", matchId],
      });
    },
  });
};
