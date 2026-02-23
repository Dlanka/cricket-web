import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeamAccessLink } from "@/features/teams/services/teams.service";

export const useCreateTeamAccessLinkMutation = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { expiresInHours?: number }) =>
      createTeamAccessLink(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId, "access-links"] });
      queryClient.invalidateQueries({ queryKey: ["team", teamId, "access-link-current"] });
    },
  });
};
