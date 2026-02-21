import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsQueryKeys } from "@/features/settings/constants/settingsQueryKeys";
import { assignTenantMember } from "@/features/settings/services/tenantMembers.service";
import type { TenantMemberUpsertPayload } from "@/features/settings/types/settings.types";

export const useAssignTenantMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TenantMemberUpsertPayload) => assignTenantMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.tenantMembers });
    },
  });
};
