import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsQueryKeys } from "@/features/settings/constants/settingsQueryKeys";
import { updateTenantMember } from "@/features/settings/services/tenantMembers.service";
import type { TenantMemberPatchPayload } from "@/features/settings/types/settings.types";

type Params = {
  membershipId: string;
  payload: TenantMemberPatchPayload;
};

export const useUpdateTenantMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ membershipId, payload }: Params) =>
      updateTenantMember(membershipId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.tenantMembers });
    },
  });
};
