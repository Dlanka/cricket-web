import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeamAccessWhatsappShare } from "@/features/teams/services/teams.service";

export const useCreateTeamAccessWhatsappShareMutation = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: { expiresInHours?: number; phoneNumber?: string }) =>
      createTeamAccessWhatsappShare(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId, "access-links"] });
      queryClient.invalidateQueries({ queryKey: ["team", teamId, "access-link-current"] });
    },
  });
};
