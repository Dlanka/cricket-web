import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeTeamAccessLink } from "@/features/teams/services/teams.service";
import type { TeamAccessLink } from "@/features/teams/types/teams.types";

export const useRevokeTeamAccessLinkMutation = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => revokeTeamAccessLink(teamId, linkId),
    onSuccess: (_, linkId) => {
      queryClient.setQueryData<TeamAccessLink[]>(
        ["team", teamId, "access-links"],
        (current) => (current ?? []).filter((link) => link.id !== linkId),
      );
      queryClient.invalidateQueries({ queryKey: ["team", teamId, "access-links"] });
      queryClient.invalidateQueries({ queryKey: ["team", teamId, "access-link-current"] });
    },
  });
};
