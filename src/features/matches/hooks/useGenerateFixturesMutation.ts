import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateFixtures } from "../services/matches.service";

export const useGenerateFixturesMutation = (tournamentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateFixtures(tournamentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["fixtures", "tournament", tournamentId],
      });
    },
  });
};
