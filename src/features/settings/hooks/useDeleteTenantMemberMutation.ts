import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsQueryKeys } from "@/features/settings/constants/settingsQueryKeys";
import { deleteTenantMember } from "@/features/settings/services/tenantMembers.service";

export const useDeleteTenantMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: string) => deleteTenantMember(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.tenantMembers });
    },
  });
};
