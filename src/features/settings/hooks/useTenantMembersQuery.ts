import { useQuery } from "@tanstack/react-query";
import { settingsQueryKeys } from "@/features/settings/constants/settingsQueryKeys";
import { getTenantMembers } from "@/features/settings/services/tenantMembers.service";

export const useTenantMembersQuery = (enabled = true) =>
  useQuery({
    queryKey: settingsQueryKeys.tenantMembers,
    queryFn: getTenantMembers,
    enabled,
  });
